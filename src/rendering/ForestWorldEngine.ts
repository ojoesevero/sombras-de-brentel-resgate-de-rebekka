import gsap from 'gsap';
import './forest-world.css';
import { SvgAssetFactory } from './SvgAssetFactory';
import { Combatant } from '../core/Combatant';
import { TurnEngine } from '../core/TurnEngine';
import { ComboSkillEngine } from '../core/ComboSkillEngine';
import { globalTimedActionService } from '../services/TimedActionService';
import { globalSaveService } from '../services/SaveService';
import { InventoryModel } from '../core/InventoryModel';
import { BattleState } from '../types/game.types';

export interface WorldEnemyEntity {
  id: string;
  name: string;
  element: HTMLElement;
  combatant: Combatant;
  x: number;
  y: number;
  originX: number;
  patrolRadius: number;
  patrolSpeed: number;
  direction: number;
  isDefeated: boolean;
}

/**
 * [100% PURE HTML5, CSS3, SVG & GSAP ENGINE]
 * Motor de Exploração e Combate Sem Imagens Rasterizadas (.jpg/.png).
 * Inspirado nas obras-primas Sea of Stars e Chrono Trigger.
 */
export class ForestWorldEngine {
  private container: HTMLElement;
  private stage!: HTMLElement;
  private playerEl!: HTMLElement;
  private allyEl!: HTMLElement;
  private timedRingEl!: HTMLElement;
  private timedTargetPointEl!: HTMLElement;
  private battleHudEl!: HTMLElement;

  // Estado do Jogador e Companheiro
  private playerPos = { x: 280, y: 160 };
  private playerVel = { x: 0, y: 0 };
  private allyPos = { x: 230, y: 170 };
  private cameraPos = { x: 0, y: 0 };
  private isMoving: boolean = false;
  private facingRight: boolean = true;

  // Teclado
  private keys: Record<string, boolean> = {};
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private animationFrameId: number | null = null;

  // Lógica de Combate
  private isCombatActive: boolean = false;
  private isExecutingAction: boolean = false;
  private turnEngine: TurnEngine | null = null;
  private comboEngine: ComboSkillEngine;
  private inventory: InventoryModel;
  private enemies: WorldEnemyEntity[] = [];
  private activeEngagedEnemy: WorldEnemyEntity | null = null;

  // Interface do Combate
  private selectedActionIdx: number = 0;
  private onExitCallback?: () => void;

  constructor(containerId: string = 'forest-world-container') {
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      document.body.appendChild(el);
    }
    this.container = el;
    this.comboEngine = new ComboSkillEngine(30);
    this.inventory = new InventoryModel();
    this.inventory.addItem('test_item_heal', 3);
    this.inventory.gold = 60;

    this.boundKeyDown = this._handleKeyDown.bind(this);
    this.boundKeyUp = this._handleKeyUp.bind(this);
  }

  public start(onExit?: () => void): void {
    this.onExitCallback = onExit;
    this._renderDOM();
    this.container.classList.add('active');

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Carrega dados salvos se existirem
    const saved = globalSaveService.load<any>();
    if (saved?.data?.inventoryData) {
      this.inventory.deserialize(saved.data.inventoryData);
    }

    this._startGameLoop();
    this._updateExplorationHud();

    // Fade-in cinematográfico do mundo
    gsap.fromTo(
      this.container.querySelector('.forest-stage'),
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
    );
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.container.classList.remove('active');
    this.container.innerHTML = '';

    if (this.onExitCallback) {
      this.onExitCallback();
    }
  }

  private _renderDOM(): void {
    this.container.innerHTML = `
      <div class="forest-viewport">
        <!-- HUD Superior de Exploração -->
        <div class="forest-exploration-hud">
          <div class="hud-stat-item">
            <span class="hud-stat-icon">⚔</span>
            <span>Rhogar & Joseph</span>
          </div>
          <div class="hud-stat-item">
            <span class="hud-stat-icon">🪙</span>
            <span id="forest-hud-gold">0g</span>
          </div>
          <div class="hud-stat-item">
            <span class="hud-stat-icon">🧪</span>
            <span id="forest-hud-potions">x0</span>
          </div>
          <div class="hud-stat-item">
            <span class="hud-stat-icon">✨</span>
            <span id="forest-hud-synergy">Sinergia: 30%</span>
          </div>
          <div class="hud-stat-item">
            <span style="color:#78909c;">[W/A/S/D] Mover | [ESC] Menu</span>
          </div>
        </div>

        <!-- Palco Principal com Camadas Parallax -->
        <div class="forest-stage">
          <!-- 1. Céu e Atmosfera -->
          <div class="layer-sky"></div>
          <div class="layer-mountains"></div>
          <div class="layer-god-rays"></div>
          <div class="layer-mist"></div>

          <!-- 2. Copas e Árvores de Fundo -->
          <div class="layer-midground-trees">
            ${SvgAssetFactory.createAncientTreeSvg(280)}
            ${SvgAssetFactory.createAncientTreeSvg(240)}
            ${SvgAssetFactory.createAncientTreeSvg(310)}
            ${SvgAssetFactory.createAncientTreeSvg(260)}
            ${SvgAssetFactory.createAncientTreeSvg(290)}
          </div>

          <!-- 3. Chão da Trilha (Playfield) -->
          <div class="layer-playfield">
            <div class="forest-path">
              <div class="path-stones"></div>

              <!-- Tochas Luminosas ao longo da Trilha -->
              <div class="torch-station" style="top: 25px; left: 180px;">
                <div class="torch-light-aura"></div>
                ${SvgAssetFactory.createTorchSvg()}
              </div>
              <div class="torch-station" style="top: 25px; left: 620px;">
                <div class="torch-light-aura"></div>
                ${SvgAssetFactory.createTorchSvg()}
              </div>
              <div class="torch-station" style="top: 25px; left: 1100px;">
                <div class="torch-light-aura"></div>
                ${SvgAssetFactory.createTorchSvg()}
              </div>
              <div class="torch-station" style="top: 25px; left: 1550px;">
                <div class="torch-light-aura"></div>
                ${SvgAssetFactory.createTorchSvg()}
              </div>

              <!-- Entidade: Rhogar Tordan -->
              <div class="entity-container player-rhogar" id="entity-rhogar">
                ${SvgAssetFactory.createRhogarSvg()}
              </div>

              <!-- Entidade: Joseph Sylven (Companheiro de Party) -->
              <div class="entity-container ally-joseph" id="entity-joseph">
                ${SvgAssetFactory.createJosephSvg()}
              </div>

              <!-- Inimigo 1: Lobo das Sombras -->
              <div class="entity-container enemy-wolf" id="entity-wolf">
                ${SvgAssetFactory.createWolfSvg()}
              </div>

              <!-- Inimigo 2: Bandido da Trilha -->
              <div class="entity-container enemy-bandit" id="entity-bandit">
                ${SvgAssetFactory.createBanditSvg()}
              </div>
            </div>
          </div>

          <!-- 4. Primeiro Plano com Desfoque 2.5D (Canopy) -->
          <div class="layer-foreground-canopy">
            <div class="canopy-branch-left"></div>
            <div class="canopy-branch-right"></div>
            <!-- Vaga-lumes Luminosos Flutuantes -->
            <div class="firefly-particle" style="top: 520px; left: 340px; animation-delay: 0.2s;"></div>
            <div class="firefly-particle" style="top: 580px; left: 720px; animation-delay: 1.1s;"></div>
            <div class="firefly-particle" style="top: 540px; left: 1180px; animation-delay: 0.7s;"></div>
            <div class="firefly-particle" style="top: 610px; left: 1450px; animation-delay: 1.8s;"></div>
          </div>
        </div>

        <!-- Anel de Sincronização de Ataque (Timed Hit Ring Sea of Stars) -->
        <div class="timed-action-overlay">
          <div class="timed-hit-ring" id="timed-hit-ring"></div>
          <div class="timed-hit-target-point" id="timed-target-point"></div>
        </div>

        <!-- HUD de Batalha Contínua Sobreposta -->
        <div class="field-battle-hud" id="field-battle-hud">
          <div class="battle-hud-header">
            <div class="active-hero-badge">
              <span class="active-hero-name" id="battle-active-hero">Rhogar Tordan</span>
              <span style="font-size:12px; color:#80deea;">[Turno do Jogador]</span>
            </div>
            <div class="synergy-bar-container">
              <span style="font-size:11px; color:#ffd54f; font-weight:bold;">SINERGIA</span>
              <div class="synergy-bar-track">
                <div class="synergy-bar-fill" id="battle-synergy-fill"></div>
              </div>
            </div>
          </div>

          <div class="battle-commands-grid">
            <div class="command-card selected" data-idx="0">
              <span class="hotkey">1</span>
              <span>Atacar</span>
            </div>
            <div class="command-card" data-idx="1">
              <span class="hotkey">2</span>
              <span>Golpe do Dragão</span>
            </div>
            <div class="command-card" data-idx="2">
              <span class="hotkey">3</span>
              <span style="color:#ffd54f;">Combo: Lâmina Sagrada</span>
            </div>
            <div class="command-card" data-idx="3">
              <span class="hotkey">4</span>
              <span>Poção de Cura</span>
            </div>
            <div class="command-card" data-idx="4">
              <span class="hotkey">5</span>
              <span>Defender</span>
            </div>
            <div class="command-card" data-idx="5">
              <span class="hotkey">6</span>
              <span>Fugir</span>
            </div>
          </div>

          <div class="command-help-text" id="battle-command-help">
            Ataque físico direto. Pressione [Z] exatamente quando o anel dourado convergir no alvo para DANO CRÍTICO!
          </div>
        </div>
      </div>
    `;

    // Cache de referências DOM
    this.stage = this.container.querySelector('.forest-stage') as HTMLElement;
    this.playerEl = document.getElementById('entity-rhogar') as HTMLElement;
    this.allyEl = document.getElementById('entity-joseph') as HTMLElement;
    this.timedRingEl = document.getElementById('timed-hit-ring') as HTMLElement;
    this.timedTargetPointEl = document.getElementById('timed-target-point') as HTMLElement;
    this.battleHudEl = document.getElementById('field-battle-hud') as HTMLElement;

    // Configuração dos Inimigos Patrulhando
    const wolfEl = document.getElementById('entity-wolf') as HTMLElement;
    const banditEl = document.getElementById('entity-bandit') as HTMLElement;

    this.enemies = [
      {
        id: 'wolf_1',
        name: 'Lobo das Sombras',
        element: wolfEl,
        combatant: new Combatant({ id: 'wolf_1', name: 'Lobo das Sombras', maxHp: 65, hp: 65, attack: 18, defense: 4, isPlayer: false }),
        x: 680,
        y: 150,
        originX: 680,
        patrolRadius: 90,
        patrolSpeed: 1.2,
        direction: 1,
        isDefeated: false
      },
      {
        id: 'bandit_1',
        name: 'Bandido da Estrada',
        element: banditEl,
        combatant: new Combatant({ id: 'bandit_1', name: 'Bandido da Estrada', maxHp: 80, hp: 80, attack: 21, defense: 6, isPlayer: false }),
        x: 1250,
        y: 165,
        originX: 1250,
        patrolRadius: 80,
        patrolSpeed: 0.9,
        direction: -1,
        isDefeated: false
      }
    ];

    this._updateEntityPositions();
  }

  private _startGameLoop(): void {
    const loop = () => {
      this._updatePhysics();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private _updatePhysics(): void {
    if (this.isCombatActive) return;

    // 1. Processamento de Movimentação do Jogador
    let vx = 0;
    let vy = 0;
    const speed = 3.5;

    if (this.keys['ArrowLeft'] || this.keys['KeyA']) vx -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) vx += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) vy -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) vy += 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.playerVel.x = vx * speed;
    this.playerVel.y = vy * speed;

    this.playerPos.x += this.playerVel.x;
    this.playerPos.y += this.playerVel.y;

    // Limites da Trilha
    this.playerPos.x = Math.max(120, Math.min(1780, this.playerPos.x));
    this.playerPos.y = Math.max(70, Math.min(230, this.playerPos.y));

    this.isMoving = vx !== 0 || vy !== 0;

    if (vx > 0) this.facingRight = true;
    if (vx < 0) this.facingRight = false;

    // 2. Companheiro Joseph Sylven segue Rhogar suavemente
    const targetAllyX = this.playerPos.x - (this.facingRight ? 46 : -46);
    const targetAllyY = this.playerPos.y + 6;
    this.allyPos.x += (targetAllyX - this.allyPos.x) * 0.12;
    this.allyPos.y += (targetAllyY - this.allyPos.y) * 0.12;

    // 3. Patrulha dos Monstros e Detecção de Proximidade
    const now = performance.now() * 0.001;
    this.enemies.forEach(enemy => {
      if (enemy.isDefeated) return;

      const offset = Math.sin(now * enemy.patrolSpeed) * enemy.patrolRadius;
      enemy.x = enemy.originX + offset;

      // Distância de engajamento contínuo
      const dx = this.playerPos.x - enemy.x;
      const dy = this.playerPos.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 55) {
        this._triggerSeamlessCombat(enemy);
      }
    });

    this._updateEntityPositions();
    this._updateCamera();
  }

  private _updateEntityPositions(): void {
    // Rhogar
    this.playerEl.style.transform = `translate3d(${this.playerPos.x}px, ${this.playerPos.y}px, 0) scaleX(${this.facingRight ? 1 : -1})`;
    this.playerEl.classList.toggle('is-moving', this.isMoving);

    // Joseph
    const allyFacing = this.playerPos.x >= this.allyPos.x;
    this.allyEl.style.transform = `translate3d(${this.allyPos.x}px, ${this.allyPos.y}px, 0) scaleX(${allyFacing ? 1 : -1})`;
    this.allyEl.classList.toggle('is-moving', this.isMoving);

    // Monstros
    this.enemies.forEach(e => {
      if (e.isDefeated) {
        e.element.style.display = 'none';
        return;
      }
      const enemyFacing = this.playerPos.x <= e.x ? -1 : 1;
      e.element.style.transform = `translate3d(${e.x}px, ${e.y}px, 0) scaleX(${enemyFacing})`;
    });
  }

  private _updateCamera(): void {
    // A câmera centraliza suavemente no jogador mantendo a perspectiva cinematográfica
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const targetCamX = -(this.playerPos.x - viewportWidth / 2);
    const targetCamY = -(this.playerPos.y + 400 - viewportHeight / 2);

    this.cameraPos.x += (targetCamX - this.cameraPos.x) * 0.08;
    this.cameraPos.y += (targetCamY - this.cameraPos.y) * 0.08;

    this.stage.style.transform = `translate3d(${this.cameraPos.x}px, ${this.cameraPos.y}px, 0)`;

    // Parallax das camadas distantes
    const mountains = this.container.querySelector('.layer-mountains') as HTMLElement;
    if (mountains) {
      mountains.style.transform = `translate3d(${this.cameraPos.x * 0.25}px, 0, 0)`;
    }

    const midTrees = this.container.querySelector('.layer-midground-trees') as HTMLElement;
    if (midTrees) {
      midTrees.style.transform = `translate3d(${this.cameraPos.x * 0.45}px, 0, 0)`;
    }
  }

  /**
   * Dispara o Combate no Próprio Chão do Mapa (Sem Transição de Tela)
   */
  private _triggerSeamlessCombat(enemy: WorldEnemyEntity): void {
    if (this.isCombatActive) return;

    this.isCombatActive = true;
    this.activeEngagedEnemy = enemy;

    // Alerta de batalha '!' sobre a criatura
    const alertEl = document.createElement('div');
    alertEl.className = 'battle-alert-bubble';
    alertEl.textContent = '!';
    enemy.element.appendChild(alertEl);

    // Congela movimentação e posiciona Joseph em formação de batalha ao lado de Rhogar
    gsap.to(this.allyPos, {
      x: this.playerPos.x - 55,
      y: this.playerPos.y + 12,
      duration: 0.35,
      ease: 'power2.out'
    });

    // Inicializa o TurnEngine integrado com a Party
    const rhogar = new Combatant({
      id: 'rhogar',
      name: 'Rhogar Tordan',
      maxHp: 120,
      hp: 120,
      attack: 24,
      defense: 8,
      isPlayer: true
    });

    const joseph = new Combatant({
      id: 'joseph',
      name: 'Joseph Sylven',
      maxHp: 110,
      hp: 110,
      attack: 18,
      defense: 10,
      isPlayer: true
    });

    this.turnEngine = new TurnEngine({
      party: [rhogar, joseph],
      enemies: [enemy.combatant],
      comboEngine: this.comboEngine
    });

    this.turnEngine.start();
    this.selectedActionIdx = 0;
    this.isExecutingAction = false;

    // Desliza o HUD de Batalha com GSAP
    this.battleHudEl.classList.add('active');
    this._updateBattleHud();
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    this.keys[e.code] = true;

    if (e.code === 'Escape') {
      if (this.isCombatActive) {
        // Ignora ou recua
      } else {
        this.stop();
      }
      return;
    }

    if (!this.isCombatActive) return;

    // Se estiver no momento de um Timed Hit (Sea of Stars Style), [Z] ou Espaço registra o acerto!
    if (globalTimedActionService.hasActiveWindow() && (e.code === 'KeyZ' || e.code === 'Space' || e.code === 'Enter')) {
      const res = globalTimedActionService.registerInput(performance.now());
      this._flashTimedResult(res.rating);
      return;
    }

    if (this.isExecutingAction) return;

    // Navegação no Menu de Comandos
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.selectedActionIdx = (this.selectedActionIdx + 1) % 6;
      this._updateBattleHud();
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.selectedActionIdx = (this.selectedActionIdx - 1 + 6) % 6;
      this._updateBattleHud();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.selectedActionIdx = (this.selectedActionIdx + 3) % 6;
      this._updateBattleHud();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.selectedActionIdx = (this.selectedActionIdx - 3 + 6) % 6;
      this._updateBattleHud();
    }

    // Teclas numéricas diretas [1-6]
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code)) {
      this.selectedActionIdx = parseInt(e.code.replace('Digit', ''), 10) - 1;
      this._updateBattleHud();
    }

    // Confirmação de Ação
    if (e.code === 'KeyZ' || e.code === 'Enter' || e.code === 'Space') {
      this._executePlayerCommand();
    }
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    this.keys[e.code] = false;
  }

  private _executePlayerCommand(): void {
    if (!this.turnEngine || !this.activeEngagedEnemy || this.isExecutingAction) return;
    this.isExecutingAction = true;

    const actionMap: ('attack' | 'skill' | 'combo' | 'item' | 'defend' | 'flee')[] = [
      'attack', 'skill', 'combo', 'item', 'defend', 'flee'
    ];
    const chosenAction = actionMap[this.selectedActionIdx];
    const hero = this.turnEngine.getActiveHero();
    const heroEl = hero.id === 'rhogar' ? this.playerEl : this.allyEl;
    const enemyEl = this.activeEngagedEnemy.element;

    if (chosenAction === 'attack' || chosenAction === 'skill' || chosenAction === 'combo') {
      // 1. Dash rápido do herói em direção ao monstro
      const originalX = hero.id === 'rhogar' ? this.playerPos.x : this.allyPos.x;
      const targetDashX = this.activeEngagedEnemy.x - 45;

      gsap.to(heroEl, {
        x: targetDashX,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          // 2. Dispara o Anel de Sincronização (Timed Hit Ring Sea of Stars)
          this._triggerTimedHitRing(this.activeEngagedEnemy!.x, this.activeEngagedEnemy!.y, () => {
            // Executa a ação do turno no motor lógico
            const result = this.turnEngine!.executePlayerAction(chosenAction as any, {
              targetIndex: 0,
              comboId: chosenAction === 'combo' ? 'combo_rhogar_joseph' : undefined
            });

            // Efeito de impacto no monstro
            gsap.to(enemyEl, {
              x: this.activeEngagedEnemy!.x + 12,
              duration: 0.08,
              yoyo: true,
              repeat: 3
            });

            this._showFloatingDamage(this.activeEngagedEnemy!.x, this.activeEngagedEnemy!.y, result.damage || 20);

            // Herói retorna à formação
            gsap.to(heroEl, {
              x: originalX,
              duration: 0.32,
              ease: 'power2.out',
              onComplete: () => {
                this._afterTurnResolved();
              }
            });
          });
        }
      });
    } else if (chosenAction === 'item') {
      this.turnEngine.executePlayerAction('item');
      this.inventory.removeItem('test_item_heal', 1);
      this._showFloatingDamage(this.playerPos.x, this.playerPos.y, 40, '#69f0ae');
      this._afterTurnResolved();
    } else if (chosenAction === 'defend') {
      this.turnEngine.executePlayerAction('defend');
      this._afterTurnResolved();
    } else if (chosenAction === 'flee') {
      const fleeRes = this.turnEngine.executePlayerAction('flee');
      if (fleeRes.success) {
        this._endBattle(false);
      } else {
        this._afterTurnResolved();
      }
    }
  }

  /**
   * Dispara o anel de convergência para o Timed Hit (Sea of Stars Style)
   */
  private _triggerTimedHitRing(targetX: number, targetY: number, onImpact: () => void): void {
    // Converte posição do mundo para o viewport
    const ringLeft = targetX + this.cameraPos.x + 24;
    const ringTop = targetY + 480 + this.cameraPos.y + 20;

    this.timedRingEl.style.left = `${ringLeft}px`;
    this.timedRingEl.style.top = `${ringTop}px`;
    this.timedTargetPointEl.style.left = `${ringLeft}px`;
    this.timedTargetPointEl.style.top = `${ringTop}px`;

    this.timedRingEl.style.opacity = '1';
    this.timedTargetPointEl.style.opacity = '0.9';

    const now = performance.now();
    const impactDurationMs = 380;
    globalTimedActionService.openWindow(now + impactDurationMs, false, 95, 200);

    gsap.fromTo(
      this.timedRingEl,
      { scale: 2.2, borderColor: '#00e5ff' },
      {
        scale: 0.9,
        duration: impactDurationMs / 1000,
        ease: 'power1.in',
        onComplete: () => {
          this.timedRingEl.style.opacity = '0';
          this.timedTargetPointEl.style.opacity = '0';
          globalTimedActionService.closeWindow();
          onImpact();
        }
      }
    );
  }

  private _flashTimedResult(rating: string): void {
    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'floating-damage';
    feedbackEl.style.color = rating === 'PERFECT' ? '#00e5ff' : '#76ff03';
    feedbackEl.style.fontSize = '24px';
    feedbackEl.textContent = rating === 'PERFECT' ? '★ PERFEITO! ★' : 'BOM!';
    feedbackEl.style.left = `${window.innerWidth / 2}px`;
    feedbackEl.style.top = `${window.innerHeight / 2 - 40}px`;
    this.container.appendChild(feedbackEl);

    gsap.to(feedbackEl, {
      y: -35,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      onComplete: () => feedbackEl.remove()
    });
  }

  private _afterTurnResolved(): void {
    if (!this.turnEngine || !this.activeEngagedEnemy) return;

    this._updateBattleHud();
    this._updateExplorationHud();

    if (this.turnEngine.isBattleOver()) {
      if (this.turnEngine.state === BattleState.VICTORY) {
        this._endBattle(true);
      } else {
        this._endBattle(false);
      }
      return;
    }

    // Se passou para o turno do inimigo
    if (this.turnEngine.state === BattleState.ENEMY_TURN) {
      setTimeout(() => this._executeEnemyTurn(), 500);
    } else {
      this.isExecutingAction = false;
    }
  }

  private _executeEnemyTurn(): void {
    if (!this.turnEngine || !this.activeEngagedEnemy) return;

    const enemyEl = this.activeEngagedEnemy.element;
    const targetHeroX = this.playerPos.x + 35;

    // Ataque do monstro
    gsap.to(enemyEl, {
      x: targetHeroX,
      duration: 0.25,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
      onRepeat: () => {
        const logs = this.turnEngine!.processEnemyTurn();
        if (logs.length > 0) {
          this._showFloatingDamage(this.playerPos.x, this.playerPos.y, logs[0].damage, '#ff1744');
          // Tremer o herói atingido
          gsap.to(this.playerEl, { x: this.playerPos.x - 8, yoyo: true, repeat: 3, duration: 0.06 });
        }
      },
      onComplete: () => {
        this.isExecutingAction = false;
        this._updateBattleHud();
        this._updateExplorationHud();

        if (this.turnEngine!.isBattleOver()) {
          this._endBattle(this.turnEngine!.state === BattleState.VICTORY);
        }
      }
    });
  }

  private _endBattle(won: boolean): void {
    this.battleHudEl.classList.remove('active');

    if (won && this.activeEngagedEnemy) {
      this.activeEngagedEnemy.isDefeated = true;
      this.inventory.gold += 35;
      this.inventory.addItem('test_item_heal', 1);

      // Efeito de dissolução suave do monstro derrotado
      gsap.to(this.activeEngagedEnemy.element, {
        opacity: 0,
        scale: 0.2,
        duration: 0.6,
        onComplete: () => {
          this.activeEngagedEnemy!.element.style.display = 'none';
        }
      });
    }

    setTimeout(() => {
      this.isCombatActive = false;
      this.activeEngagedEnemy = null;
      this.turnEngine = null;
      this.isExecutingAction = false;
      this._updateExplorationHud();
    }, 800);
  }

  private _showFloatingDamage(worldX: number, worldY: number, damage: number, color: string = '#ffea00'): void {
    const el = document.createElement('div');
    el.className = 'floating-damage';
    el.style.color = color;
    el.textContent = `${damage > 0 ? '-' : '+'}${Math.abs(damage)}`;

    const screenX = worldX + this.cameraPos.x + 24;
    const screenY = worldY + 480 + this.cameraPos.y - 10;
    el.style.left = `${screenX}px`;
    el.style.top = `${screenY}px`;

    this.container.appendChild(el);

    gsap.to(el, {
      y: -40,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out',
      onComplete: () => el.remove()
    });
  }

  private _updateBattleHud(): void {
    if (!this.turnEngine) return;

    const hero = this.turnEngine.getActiveHero();
    const heroNameEl = document.getElementById('battle-active-hero');
    if (heroNameEl) heroNameEl.textContent = hero.name;

    const synergyFill = document.getElementById('battle-synergy-fill');
    if (synergyFill) {
      synergyFill.style.width = `${this.comboEngine.synergyPoints}%`;
    }

    const cards = this.container.querySelectorAll('.command-card');
    cards.forEach((card, idx) => {
      card.classList.toggle('selected', idx === this.selectedActionIdx);
    });

    const helpEl = document.getElementById('battle-command-help');
    const helps = [
      'Ataque físico básico. Pressione [Z] exatamente quando o anel convergir para DANO CRÍTICO!',
      'Golpe especial do guerreiro draconato causando dano concentrado com fúria.',
      `Técnica combinada de Rhogar e Joseph. Requer 35 Sinergia (Atual: ${this.comboEngine.synergyPoints}%).`,
      `Restaura 40 HP imediatamente (Disponíveis: x${this.inventory.getItemCount('test_item_heal')}).`,
      'Postura de guarda para mitigar ataques inimigos e recuperar fôlego.',
      'Recuo tático seguro de volta à trilha da floresta.'
    ];
    if (helpEl) helpEl.textContent = helps[this.selectedActionIdx] || '';
  }

  private _updateExplorationHud(): void {
    const goldEl = document.getElementById('forest-hud-gold');
    if (goldEl) goldEl.textContent = `${this.inventory.gold}g`;

    const potionsEl = document.getElementById('forest-hud-potions');
    if (potionsEl) potionsEl.textContent = `x${this.inventory.getItemCount('test_item_heal')}`;

    const synergyEl = document.getElementById('forest-hud-synergy');
    if (synergyEl) synergyEl.textContent = `Sinergia: ${this.comboEngine.synergyPoints}%`;
  }
}
