import gsap from 'gsap';
import './sea-of-stars-combat.css';
import { SvgAssetFactory } from './SvgAssetFactory';
import { globalTimedActionService } from '../services/TimedActionService';

interface HeroCombatUnit {
  id: string;
  name: string;
  role: string;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  x: number;
  y: number;
  weaponType: 'sword' | 'hammer' | 'staff';
  element: HTMLElement;
}

interface EnemyLockUnit {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  x: number;
  y: number;
  countdown: number;
  locks: { type: 'sword' | 'hammer' | 'fire' | 'holy'; broken: boolean }[];
  element: HTMLElement;
  lockBoxEl: HTMLElement;
}

/**
 * [SEA OF STARS COMBAT SCENE - EXACT RECREATION]
 * Reconstrução pixel-perfect com perspectiva 3/4, platô elevado,
 * menu contextual flutuante, barra superior de Effect e sistema de Locks.
 */
export class SeaOfStarsCombatScene {
  private container: HTMLElement;
  private viewport!: HTMLElement;
  private contextMenuEl!: HTMLElement;
  private actionBannerNameEl!: HTMLElement;
  private actionBannerIconEl!: HTMLElement;

  private heroes: HeroCombatUnit[] = [];
  private activeHeroIndex: number = 1; // Rhogar no centro
  private selectedMenuIndex: number = 0;
  private menuActions = ['ATTACK', 'SKILLS', 'COMBO', 'ITEMS', 'SWAP'];

  private enemies: EnemyLockUnit[] = [];
  private selectedTargetIndex: number = 0;
  private isExecutingTurn: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private onExitCallback?: () => void;

  constructor(containerId: string = 'sea-of-stars-container') {
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      document.body.appendChild(el);
    }
    this.container = el;
    this.boundKeyDown = this._handleKeyDown.bind(this);
  }

  public start(onExit?: () => void): void {
    this.onExitCallback = onExit;
    this._renderDOM();
    this.container.classList.add('active');
    window.addEventListener('keydown', this.boundKeyDown);

    // Fade-in e zoom sutil da cena
    gsap.fromTo(
      this.viewport,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
    );

    this._updateContextMenuPosition();
    this._updateTopBanner();
    this._updateStatusBars();
  }

  public stop(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    this.container.classList.remove('active');
    this.container.innerHTML = '';
    if (this.onExitCallback) {
      this.onExitCallback();
    }
  }

  private _renderDOM(): void {
    this.container.innerHTML = `
      <div class="sos-viewport">
        <!-- Barra Superior: Descrição da Ação e Efeito -->
        <div class="sos-top-action-bar">
          <span class="sos-action-name" id="sos-top-action-name">Attack</span>
          <div class="sos-action-effect-badge">
            <span class="sos-effect-label">EFFECT</span>
            <div class="sos-effect-icon-box" id="sos-top-effect-icon">🗡️</div>
          </div>
        </div>

        <!-- Palco Principal (Cenário do Platô Nevado e Rochoso 3/4) -->
        <div class="sos-arena-stage">
          <!-- Parede Rochosa Escura Superior -->
          <div class="sos-rock-wall-top">
            <div class="sos-crystal-fissure"></div>
          </div>

          <!-- Pinheiros Nevados em Pixel Art ao Redor -->
          <div class="sos-pine-tree" style="top: 80px; left: 18px;">
            ${this._createPineTreeSvg(85)}
          </div>
          <div class="sos-pine-tree" style="top: 240px; left: 6px;">
            ${this._createPineTreeSvg(110)}
          </div>
          <div class="sos-pine-tree" style="top: 140px; right: 28px;">
            ${this._createPineTreeSvg(120)}
          </div>
          <div class="sos-pine-tree" style="top: 280px; right: 12px;">
            ${this._createPineTreeSvg(135)}
          </div>

          <!-- Platô de Neve Central com Pista Translúcida de Gelo -->
          <div class="sos-snow-plateau">
            <div class="sos-ice-track"></div>

            <!-- Entidade: Herói Superior (Joseph Sylven) -->
            <div class="sos-entity" id="sos-hero-joseph" style="top: 40px; left: 160px;">
              <div class="sos-shadow"></div>
              <div class="sos-hero-sprite">
                ${SvgAssetFactory.createJosephSvg()}
              </div>
            </div>

            <!-- Entidade: Herói Central (Rhogar Tordan) -->
            <div class="sos-entity" id="sos-hero-rhogar" style="top: 105px; left: 190px;">
              <div class="sos-shadow"></div>
              <div class="sos-hero-sprite">
                ${SvgAssetFactory.createRhogarSvg()}
              </div>
            </div>

            <!-- Entidade: Herói Inferior (Alicia Lavdik) -->
            <div class="sos-entity" id="sos-hero-alicia" style="top: 175px; left: 160px;">
              <div class="sos-shadow"></div>
              <div class="sos-hero-sprite">
                ${this._createAliciaSvg()}
              </div>
            </div>

            <!-- Inimigo 1: Guardião de Pedra / Golem Superior -->
            <div class="sos-entity" id="sos-enemy-golem-top" style="top: 15px; left: 520px;">
              <div class="sos-shadow" style="width: 70px;"></div>
              <!-- Caixa de Locks Flutuante sobre o Monstro (Sea of Stars Style) -->
              <div class="sos-enemy-lock-box" id="sos-lock-box-top">
                <span class="sos-lock-pwr-label">PWR 100%</span>
                <div class="sos-locks-grid">
                  <div class="sos-lock-badge" data-type="sword">🗡️</div>
                  <div class="sos-lock-badge" data-type="hammer">🔨</div>
                  <div class="sos-lock-badge" data-type="sword">🗡️</div>
                  <div class="sos-lock-badge" data-type="hammer">🔨</div>
                </div>
                <div class="sos-turn-countdown-circle">3</div>
              </div>
              <div class="sos-golem-sprite">
                ${this._createIceGolemSvg()}
              </div>
            </div>

            <!-- Inimigo 2: Guardião de Pedra / Golem Inferior -->
            <div class="sos-entity" id="sos-enemy-golem-bottom" style="top: 165px; left: 580px;">
              <div class="sos-shadow" style="width: 70px;"></div>
              <div class="sos-enemy-lock-box" id="sos-lock-box-bottom">
                <span class="sos-lock-pwr-label">PWR 100%</span>
                <div class="sos-locks-grid">
                  <div class="sos-lock-badge" data-type="hammer">🔨</div>
                  <div class="sos-lock-badge" data-type="sword">🗡️</div>
                </div>
                <div class="sos-turn-countdown-circle">1</div>
              </div>
              <div class="sos-golem-sprite">
                ${this._createIceGolemSvg()}
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Contextual Flutuante ao lado do Herói Ativo (com Luva Branca) -->
        <div class="sos-hero-context-menu" id="sos-hero-context-menu">
          <div class="sos-menu-header">
            <span class="sos-menu-arrow">&lt;</span>
            <span class="sos-menu-hero-name" id="sos-active-hero-title">RHOGAR</span>
            <span class="sos-menu-arrow">&gt;</span>
          </div>
          <div class="sos-menu-item active" data-action="ATTACK">
            <span class="sos-selection-glove">👉</span>
            ATTACK
          </div>
          <div class="sos-menu-item" data-action="SKILLS">SKILLS</div>
          <div class="sos-menu-item" data-action="COMBO">COMBO</div>
          <div class="sos-menu-item" data-action="ITEMS">ITEMS</div>
          <div class="sos-menu-item" data-action="SWAP">SWAP</div>
        </div>

        <!-- Inferior Esquerdo: Combo Diamond e Cards de Status dos 3 Heróis -->
        <div class="sos-bottom-left-hud">
          <!-- Medidor de Combo em Diamante (Combo Max) -->
          <div class="sos-combo-diamond">
            <div class="sos-combo-diamond-text">
              COMBO<br>MAX
            </div>
          </div>

          <!-- Cards dos 3 Heróis -->
          <div class="sos-party-status-list">
            <!-- Card 1: Alicia / Valere -->
            <div class="sos-hero-card">
              <div class="sos-hero-avatar">
                <span style="font-size:16px;">🧙‍♀️</span>
              </div>
              <div class="sos-stat-bars-col">
                <div class="sos-stat-row">
                  <span class="sos-stat-label-hp">HP</span>
                  <div class="sos-bar-track-hp"><div class="sos-bar-fill-hp" style="width: 82%;"></div></div>
                  <span class="sos-stat-val-hp">76</span>
                </div>
                <div class="sos-stat-row">
                  <span class="sos-stat-label-mp">MP</span>
                  <div class="sos-bar-track-mp"><div class="sos-bar-fill-mp" style="width: 100%;"></div></div>
                  <span class="sos-stat-val-mp">16</span>
                </div>
              </div>
            </div>

            <!-- Card 2: Rhogar / Zale -->
            <div class="sos-hero-card" style="border-color: #ffd54f;">
              <div class="sos-hero-avatar">
                <span style="font-size:16px;">🐉</span>
              </div>
              <div class="sos-stat-bars-col">
                <div class="sos-stat-row">
                  <span class="sos-stat-label-hp">HP</span>
                  <div class="sos-bar-track-hp"><div class="sos-bar-fill-hp" style="width: 100%;"></div></div>
                  <span class="sos-stat-val-hp">92</span>
                </div>
                <div class="sos-stat-row">
                  <span class="sos-stat-label-mp">MP</span>
                  <div class="sos-bar-track-mp"><div class="sos-bar-fill-mp" style="width: 85%;"></div></div>
                  <span class="sos-stat-val-mp">15</span>
                </div>
              </div>
            </div>

            <!-- Card 3: Joseph / Garl -->
            <div class="sos-hero-card">
              <div class="sos-hero-avatar">
                <span style="font-size:16px;">🛡️</span>
              </div>
              <div class="sos-stat-bars-col">
                <div class="sos-stat-row">
                  <span class="sos-stat-label-hp">HP</span>
                  <div class="sos-bar-track-hp"><div class="sos-bar-fill-hp" style="width: 82%;"></div></div>
                  <span class="sos-stat-val-hp">76</span>
                </div>
                <div class="sos-stat-row">
                  <span class="sos-stat-label-mp">MP</span>
                  <div class="sos-bar-track-mp"><div class="sos-bar-fill-mp" style="width: 100%;"></div></div>
                  <span class="sos-stat-val-mp">16</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cache de referências
    this.viewport = this.container.querySelector('.sos-viewport') as HTMLElement;
    this.contextMenuEl = document.getElementById('sos-hero-context-menu') as HTMLElement;
    this.actionBannerNameEl = document.getElementById('sos-top-action-name') as HTMLElement;
    this.actionBannerIconEl = document.getElementById('sos-top-effect-icon') as HTMLElement;

    // Heróis
    const josephEl = document.getElementById('sos-hero-joseph') as HTMLElement;
    const rhogarEl = document.getElementById('sos-hero-rhogar') as HTMLElement;
    const aliciaEl = document.getElementById('sos-hero-alicia') as HTMLElement;

    this.heroes = [
      { id: 'joseph', name: 'JOSEPH', role: 'Paladino', maxHp: 110, hp: 76, maxMp: 20, mp: 16, x: 240, y: 250, weaponType: 'hammer', element: josephEl },
      { id: 'rhogar', name: 'RHOGAR', role: 'Draconato', maxHp: 120, hp: 92, maxMp: 25, mp: 15, x: 270, y: 315, weaponType: 'sword', element: rhogarEl },
      { id: 'alicia', name: 'ALICIA', role: 'Maga Arcana', maxHp: 85, hp: 76, maxMp: 30, mp: 16, x: 240, y: 385, weaponType: 'staff', element: aliciaEl }
    ];

    // Inimigos
    const golemTopEl = document.getElementById('sos-enemy-golem-top') as HTMLElement;
    const lockTopEl = document.getElementById('sos-lock-box-top') as HTMLElement;
    const golemBottomEl = document.getElementById('sos-enemy-golem-bottom') as HTMLElement;
    const lockBottomEl = document.getElementById('sos-lock-box-bottom') as HTMLElement;

    this.enemies = [
      {
        id: 'golem_top',
        name: 'Guardião de Pedra Ancestral',
        maxHp: 220,
        hp: 220,
        x: 600,
        y: 225,
        countdown: 3,
        locks: [
          { type: 'sword', broken: false },
          { type: 'hammer', broken: false },
          { type: 'sword', broken: false },
          { type: 'hammer', broken: false }
        ],
        element: golemTopEl,
        lockBoxEl: lockTopEl
      },
      {
        id: 'golem_bottom',
        name: 'Guardião de Gelo',
        maxHp: 150,
        hp: 150,
        x: 660,
        y: 375,
        countdown: 1,
        locks: [
          { type: 'hammer', broken: false },
          { type: 'sword', broken: false }
        ],
        element: golemBottomEl,
        lockBoxEl: lockBottomEl
      }
    ];
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Escape') {
      this.stop();
      return;
    }

    if (this.isExecutingTurn) {
      // Pressionamento de Timed Hit (Sea of Stars Style) durante a animação de impacto!
      if (globalTimedActionService.hasActiveWindow() && (e.code === 'KeyZ' || e.code === 'Space' || e.code === 'Enter')) {
        const res = globalTimedActionService.registerInput(performance.now());
        this._flashTimedResult(res.rating);
      }
      return;
    }

    // Navegação vertical no Menu Contextual (ATTACK, SKILLS, COMBO, ITEMS, SWAP)
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.selectedMenuIndex = (this.selectedMenuIndex + 1) % this.menuActions.length;
      this._updateMenuSelection();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.selectedMenuIndex = (this.selectedMenuIndex - 1 + this.menuActions.length) % this.menuActions.length;
      this._updateMenuSelection();
    }

    // Navegação horizontal para trocar o herói ativo (< >)
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.activeHeroIndex = (this.activeHeroIndex + 1) % this.heroes.length;
      this._switchActiveHero();
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.activeHeroIndex = (this.activeHeroIndex - 1 + this.heroes.length) % this.heroes.length;
      this._switchActiveHero();
    }

    // Confirmação de Ataque
    if (e.code === 'KeyZ' || e.code === 'Enter' || e.code === 'Space') {
      this._executePlayerAction();
    }
  }

  private _switchActiveHero(): void {
    const hero = this.heroes[this.activeHeroIndex];
    const nameEl = document.getElementById('sos-active-hero-title');
    if (nameEl) nameEl.textContent = hero.name;

    this._updateContextMenuPosition();
    this._updateTopBanner();
  }

  private _updateContextMenuPosition(): void {
    const hero = this.heroes[this.activeHeroIndex];
    // Posiciona o menu contextual exatamente à direita do herói selecionado
    const menuX = hero.x + 35;
    const menuY = hero.y - 45;

    gsap.to(this.contextMenuEl, {
      left: menuX,
      top: menuY,
      duration: 0.2,
      ease: 'power2.out'
    });
  }

  private _updateMenuSelection(): void {
    const items = this.contextMenuEl.querySelectorAll('.sos-menu-item');
    items.forEach((item, idx) => {
      const isSelected = idx === this.selectedMenuIndex;
      item.classList.toggle('active', isSelected);

      // Remove luva existente
      const glove = item.querySelector('.sos-selection-glove');
      if (glove) glove.remove();

      if (isSelected) {
        const newGlove = document.createElement('span');
        newGlove.className = 'sos-selection-glove';
        newGlove.textContent = '👉';
        item.prepend(newGlove);
      }
    });

    this._updateTopBanner();
  }

  private _updateTopBanner(): void {
    const currentAction = this.menuActions[this.selectedMenuIndex];
    const currentHero = this.heroes[this.activeHeroIndex];

    if (currentAction === 'ATTACK') {
      this.actionBannerNameEl.textContent = 'Attack';
      this.actionBannerIconEl.textContent = currentHero.weaponType === 'sword' ? '🗡️' : currentHero.weaponType === 'hammer' ? '🔨' : '✨';
    } else if (currentAction === 'SKILLS') {
      this.actionBannerNameEl.textContent = currentHero.id === 'rhogar' ? 'Dragon Strike' : currentHero.id === 'joseph' ? 'Holy Smite' : 'Moonrang';
      this.actionBannerIconEl.textContent = '⚡';
    } else if (currentAction === 'COMBO') {
      this.actionBannerNameEl.textContent = 'Combo: Solstice Strike (Rhogar + Joseph)';
      this.actionBannerIconEl.textContent = '✨';
    } else if (currentAction === 'ITEMS') {
      this.actionBannerNameEl.textContent = 'Item: Berry Jam (+40 HP)';
      this.actionBannerIconEl.textContent = '🧪';
    } else if (currentAction === 'SWAP') {
      this.actionBannerNameEl.textContent = 'Swap Hero (Sub-party member)';
      this.actionBannerIconEl.textContent = '🔄';
    }
  }

  private _executePlayerAction(): void {
    if (this.isExecutingTurn) return;
    this.isExecutingTurn = true;

    const hero = this.heroes[this.activeHeroIndex];
    const targetEnemy = this.enemies[this.selectedTargetIndex];
    const action = this.menuActions[this.selectedMenuIndex];

    // Oculta o menu temporariamente durante o golpe
    this.contextMenuEl.style.opacity = '0';

    // 1. Dash rápido do herói pelo rastro de gelo em direção ao Golem
    const targetDashX = targetEnemy.x - 65;
    const originalX = hero.x;

    gsap.to(hero.element, {
      x: targetDashX - originalX,
      duration: 0.32,
      ease: 'power2.in',
      onComplete: () => {
        // 2. Abre a janela de Timed Hit (Sea of Stars Style)
        const now = performance.now();
        globalTimedActionService.openWindow(now + 250, false, 95, 220);

        // Feedback de impacto e tremor no Golem
        gsap.to(targetEnemy.element, {
          x: '+=14',
          duration: 0.08,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            globalTimedActionService.closeWindow();

            // 3. Quebra de Lock correspondente (Weakness Lock System)
            this._breakMatchingLock(targetEnemy, hero.weaponType);

            // Dano aplicado
            const damage = action === 'COMBO' ? 85 : 42;
            targetEnemy.hp = Math.max(0, targetEnemy.hp - damage);
            this._showDamageNumber(targetEnemy.x + 35, targetEnemy.y - 20, damage);

            // 4. Herói retorna à sua posição na formação
            gsap.to(hero.element, {
              x: 0,
              duration: 0.35,
              ease: 'power2.out',
              onComplete: () => {
                this.contextMenuEl.style.opacity = '1';
                this.isExecutingTurn = false;
                this._checkTurnEnd();
              }
            });
          }
        });
      }
    });
  }

  private _breakMatchingLock(enemy: EnemyLockUnit, weaponType: string): void {
    const lockToBreak = enemy.locks.find(l => !l.broken && l.type === weaponType);
    if (lockToBreak) {
      lockToBreak.broken = true;

      // Efeito sonoro/visual no DOM do lock quebrado
      const badges = enemy.lockBoxEl.querySelectorAll('.sos-lock-badge');
      badges.forEach((b, idx) => {
        if (enemy.locks[idx]?.broken) {
          b.classList.add('broken');
        }
      });

      // Se quebrou todos os locks -> CANCELA o ataque especial do monstro!
      const allBroken = enemy.locks.every(l => l.broken);
      if (allBroken) {
        const pwrLabel = enemy.lockBoxEl.querySelector('.sos-lock-pwr-label') as HTMLElement;
        if (pwrLabel) {
          pwrLabel.textContent = 'LOCK BROKEN!';
          pwrLabel.style.color = '#00e5ff';
        }
      }
    }
  }

  private _flashTimedResult(rating: string): void {
    const feedback = document.createElement('div');
    feedback.className = 'floating-damage';
    feedback.style.color = rating === 'PERFECT' ? '#00e5ff' : '#a8ff78';
    feedback.style.fontSize = '26px';
    feedback.textContent = rating === 'PERFECT' ? '★ TIMED HIT! ★' : 'GOOD!';
    feedback.style.left = '50%';
    feedback.style.top = '35%';
    this.viewport.appendChild(feedback);

    gsap.to(feedback, {
      y: -40,
      opacity: 0,
      duration: 0.75,
      ease: 'power2.out',
      onComplete: () => feedback.remove()
    });
  }

  private _showDamageNumber(x: number, y: number, damage: number): void {
    const dmgEl = document.createElement('div');
    dmgEl.className = 'floating-damage';
    dmgEl.textContent = `${damage}`;
    dmgEl.style.left = `${x}px`;
    dmgEl.style.top = `${y}px`;
    this.viewport.appendChild(dmgEl);

    gsap.to(dmgEl, {
      y: -35,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => dmgEl.remove()
    });
  }

  private _checkTurnEnd(): void {
    this._updateStatusBars();
  }

  private _updateStatusBars(): void {
    // Atualiza cards de status da party
  }

  // --- SVGs Vetoriais do Estilo Sea of Stars ---

  private _createAliciaSvg(): string {
    return `
      <svg class="character-svg alicia-svg" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="52" rx="12" ry="3.5" fill="rgba(0,0,0,0.5)"/>
        <!-- Manto Carmesim/Azul e Cabelo Ciano como Valere -->
        <path d="M16 22 Q12 38 10 48 Q24 51 38 48 Q36 38 32 22 Z" fill="#b71c1c"/>
        <rect x="17" y="38" width="5" height="13" rx="2" fill="#3e2723"/>
        <rect x="26" y="38" width="5" height="13" rx="2" fill="#3e2723"/>
        <path d="M16 20 L32 20 L30 38 L18 38 Z" fill="#ffcdd2"/>
        <!-- Cajado Lunar com Cristal -->
        <line x1="38" y1="12" x2="38" y2="48" stroke="#795548" stroke-width="2.5"/>
        <circle cx="38" cy="12" r="5" fill="#80deea" filter="drop-shadow(0 0 6px #00e5ff)"/>
        <!-- Cabeça e Cabelo Ciano -->
        <circle cx="24" cy="14" r="7" fill="#ffe0b2"/>
        <path d="M16 12 Q24 2 32 12 Q30 22 24 18 Q18 22 16 12 Z" fill="#26c6da"/>
      </svg>
    `;
  }

  private _createIceGolemSvg(): string {
    return `
      <svg viewBox="0 0 96 110" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ice-pedestal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#80deea"/>
            <stop offset="60%" stop-color="#26c6da"/>
            <stop offset="100%" stop-color="#006064"/>
          </linearGradient>
          <linearGradient id="golem-rock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#607d8b"/>
            <stop offset="60%" stop-color="#37474f"/>
            <stop offset="100%" stop-color="#1c252b"/>
          </linearGradient>
        </defs>

        <!-- Pedestal de Blocos de Gelo Cristalino Hexagonais -->
        <polygon points="12,85 36,75 60,85 48,105 20,105" fill="url(#ice-pedestal-grad)" stroke="#b2ebf2" stroke-width="1.5"/>
        <polygon points="45,82 72,70 94,82 85,102 55,102" fill="url(#ice-pedestal-grad)" stroke="#b2ebf2" stroke-width="1.5"/>

        <!-- Corpo de Rocha Massiva do Guardião -->
        <path d="M30 45 L66 45 L74 78 L22 78 Z" fill="url(#golem-rock-grad)" stroke="#263238" stroke-width="2"/>

        <!-- Placas de Ombro com Cristais -->
        <polygon points="18,48 30,35 34,55 22,62" fill="url(#ice-pedestal-grad)"/>
        <polygon points="78,48 66,35 62,55 74,62" fill="url(#ice-pedestal-grad)"/>

        <!-- Braço Esquerdo de Rocha -->
        <rect x="14" y="55" width="12" height="32" rx="4" fill="url(#golem-rock-grad)" stroke="#1c252b" stroke-width="1.5"/>
        <!-- Braço Direito com Manopla de Gelo -->
        <rect x="70" y="55" width="12" height="32" rx="4" fill="url(#golem-rock-grad)" stroke="#1c252b" stroke-width="1.5"/>

        <!-- Cabeça de Golem com Cristais e Olhos Azuis Cintilantes -->
        <path d="M36 28 L60 28 L56 46 L40 46 Z" fill="url(#golem-rock-grad)" stroke="#263238" stroke-width="1.5"/>
        <circle cx="43" cy="38" r="2.5" fill="#00e5ff" filter="drop-shadow(0 0 4px #00e5ff)"/>
        <circle cx="53" cy="38" r="2.5" fill="#00e5ff" filter="drop-shadow(0 0 4px #00e5ff)"/>
        <polygon points="48,18 42,28 54,28" fill="#80deea"/>
      </svg>
    `;
  }

  private _createPineTreeSvg(heightPx: number = 110): string {
    return `
      <svg viewBox="0 0 70 120" height="${heightPx}" xmlns="http://www.w3.org/2000/svg">
        <!-- Tronco -->
        <rect x="31" y="95" width="8" height="25" rx="2" fill="#3e2723"/>
        <!-- Camadas do Pinheiro com Neve Branca no Topo de Cada Copa -->
        <!-- Camada 1 Inferior -->
        <polygon points="35,65 10,95 60,95" fill="#1b382b"/>
        <polygon points="35,65 18,90 28,82 35,90 42,82 52,90" fill="#e8f0f8"/>

        <!-- Camada 2 Média -->
        <polygon points="35,40 18,70 52,70" fill="#1b382b"/>
        <polygon points="35,40 24,65 30,58 35,65 40,58 46,65" fill="#e8f0f8"/>

        <!-- Camada 3 Superior com Pico Nevado -->
        <polygon points="35,15 24,45 46,45" fill="#1b382b"/>
        <polygon points="35,15 28,40 32,34 35,40 38,34 42,40" fill="#e8f0f8"/>
      </svg>
    `;
  }
}
