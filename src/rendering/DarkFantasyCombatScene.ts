import gsap from 'gsap';
import './dark-fantasy-combat.css';

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
  maxCountdown: number;
  locks: { type: 'sword' | 'hammer' | 'fire' | 'holy'; broken: boolean }[];
  element: HTMLElement;
  lockBoxEl: HTMLElement;
}

/**
 * [DARK FANTASY COMBAT SCENE - 100% TACTICAL]
 * Sem Timed Hits. Focado em estratégia, turnos e AI punitiva.
 */
export class DarkFantasyCombatScene {
  private container: HTMLElement;
  private viewport!: HTMLElement;
  private contextMenuEl!: HTMLElement;
  private actionBannerNameEl!: HTMLElement;
  private actionBannerIconEl!: HTMLElement;

  private heroes: HeroCombatUnit[] = [];
  private activeHeroIndex: number = 1;
  private selectedMenuIndex: number = 0;
  private menuActions = ['ATTACK', 'SKILLS', 'PENITENCE', 'ITEMS', 'SWAP'];

  private enemies: EnemyLockUnit[] = [];
  private selectedTargetIndex: number = 0;
  private isExecutingTurn: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private onExitCallback?: () => void;

  constructor(containerId: string = 'dark-fantasy-container') {
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

    gsap.fromTo(
      this.viewport,
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
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
      <div class="df-viewport">
        <!-- Barra Superior -->
        <div class="df-top-action-bar">
          <span class="df-action-name" id="df-top-action-name">Attack</span>
          <div class="df-action-effect-badge">
            <span class="df-effect-label">ACTION</span>
            <div class="df-effect-icon-box" id="df-top-effect-icon">🗡️</div>
          </div>
        </div>

        <div class="df-arena-stage">
          <div class="df-ground-plateau">
            <!-- Entidade: Herói Superior (Joseph Sylven) -->
            <div class="df-entity" id="df-hero-joseph" style="top: -10px; left: 160px;">
              <div class="df-shadow"></div>
              <div class="df-hero-sprite joseph"></div>
            </div>

            <!-- Entidade: Herói Central (Rhogar Tordan) -->
            <div class="df-entity" id="df-hero-rhogar" style="top: 75px; left: 190px;">
              <div class="df-shadow"></div>
              <div class="df-hero-sprite rhogar"></div>
            </div>

            <!-- Entidade: Herói Inferior (Alicia Lavdik) -->
            <div class="df-entity" id="df-hero-alicia" style="top: 145px; left: 160px;">
              <div class="df-shadow"></div>
              <div class="df-hero-sprite alicia"></div>
            </div>

            <!-- Inimigo 1: Guardião de Pedra Ancestral -->
            <div class="df-entity" id="df-enemy-golem-top" style="top: -25px; left: 520px;">
              <div class="df-shadow" style="width: 70px;"></div>
              <div class="df-enemy-lock-box" id="df-lock-box-top">
                <span class="df-lock-pwr-label">GUARD</span>
                <div class="df-locks-grid">
                  <div class="df-lock-badge" data-type="sword">🗡️</div>
                  <div class="df-lock-badge" data-type="hammer">🔨</div>
                  <div class="df-lock-badge" data-type="sword">🗡️</div>
                  <div class="df-lock-badge" data-type="hammer">🔨</div>
                </div>
                <div class="df-turn-countdown-circle" id="df-enemy-cd-top">3</div>
              </div>
              <div class="df-golem-sprite"></div>
            </div>

            <!-- Inimigo 2: Guardião de Gelo -->
            <div class="df-entity" id="df-enemy-golem-bottom" style="top: 125px; left: 580px;">
              <div class="df-shadow" style="width: 70px;"></div>
              <div class="df-enemy-lock-box" id="df-lock-box-bottom">
                <span class="df-lock-pwr-label">GUARD</span>
                <div class="df-locks-grid">
                  <div class="df-lock-badge" data-type="hammer">🔨</div>
                  <div class="df-lock-badge" data-type="sword">🗡️</div>
                </div>
                <div class="df-turn-countdown-circle" id="df-enemy-cd-bottom">1</div>
              </div>
              <div class="df-golem-sprite"></div>
            </div>
          </div>
        </div>

        <!-- Menu Contextual Flutuante -->
        <div class="df-hero-context-menu" id="df-hero-context-menu">
          <div class="df-menu-header">
            <span class="df-menu-arrow">&lt;</span>
            <span class="df-menu-hero-name" id="df-active-hero-title">RHOGAR</span>
            <span class="df-menu-arrow">&gt;</span>
          </div>
          <div class="df-menu-item active" data-action="ATTACK">
            <span class="df-selection-cursor">►</span>
            ATTACK
          </div>
          <div class="df-menu-item" data-action="SKILLS">SKILLS</div>
          <div class="df-menu-item" data-action="PENITENCE">PENITENCE</div>
          <div class="df-menu-item" data-action="ITEMS">ITEMS</div>
          <div class="df-menu-item" data-action="SWAP">SWAP</div>
        </div>

        <!-- Inferior Esquerdo: HUD -->
        <div class="df-bottom-left-hud">
          <!-- Medidor de Tensão -->
          <div class="df-tension-gauge">
            <div class="df-tension-fill" style="height: 35%;"></div>
            <div class="df-tension-text">TENSION</div>
          </div>

          <!-- Cards dos Heróis -->
          <div class="df-party-status-list">
            <!-- Joseph -->
            <div class="df-hero-card" id="df-card-joseph">
              <div class="df-hero-avatar joseph-avatar"></div>
              <div class="df-stat-bars-col">
                <div class="df-stat-row">
                  <span class="df-stat-label-hp">HP</span>
                  <div class="df-bar-track-hp"><div class="df-bar-fill-hp" id="df-hp-fill-joseph" style="width: 100%;"></div></div>
                  <span class="df-stat-val-hp" id="df-hp-val-joseph">110</span>
                </div>
                <div class="df-stat-row">
                  <span class="df-stat-label-mp">MP</span>
                  <div class="df-bar-track-mp"><div class="df-bar-fill-mp" id="df-mp-fill-joseph" style="width: 80%;"></div></div>
                  <span class="df-stat-val-mp" id="df-mp-val-joseph">16</span>
                </div>
              </div>
            </div>

            <!-- Rhogar -->
            <div class="df-hero-card" id="df-card-rhogar" style="border-left-color: #b22222;">
              <div class="df-hero-avatar rhogar-avatar"></div>
              <div class="df-stat-bars-col">
                <div class="df-stat-row">
                  <span class="df-stat-label-hp">HP</span>
                  <div class="df-bar-track-hp"><div class="df-bar-fill-hp" id="df-hp-fill-rhogar" style="width: 100%;"></div></div>
                  <span class="df-stat-val-hp" id="df-hp-val-rhogar">120</span>
                </div>
                <div class="df-stat-row">
                  <span class="df-stat-label-mp">MP</span>
                  <div class="df-bar-track-mp"><div class="df-bar-fill-mp" id="df-mp-fill-rhogar" style="width: 60%;"></div></div>
                  <span class="df-stat-val-mp" id="df-mp-val-rhogar">15</span>
                </div>
              </div>
            </div>

            <!-- Alicia -->
            <div class="df-hero-card" id="df-card-alicia">
              <div class="df-hero-avatar alicia-avatar"></div>
              <div class="df-stat-bars-col">
                <div class="df-stat-row">
                  <span class="df-stat-label-hp">HP</span>
                  <div class="df-bar-track-hp"><div class="df-bar-fill-hp" id="df-hp-fill-alicia" style="width: 89%;"></div></div>
                  <span class="df-stat-val-hp" id="df-hp-val-alicia">76</span>
                </div>
                <div class="df-stat-row">
                  <span class="df-stat-label-mp">MP</span>
                  <div class="df-bar-track-mp"><div class="df-bar-fill-mp" id="df-mp-fill-alicia" style="width: 100%;"></div></div>
                  <span class="df-stat-val-mp" id="df-mp-val-alicia">30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.viewport = this.container.querySelector('.df-viewport') as HTMLElement;
    this.contextMenuEl = document.getElementById('df-hero-context-menu') as HTMLElement;
    this.actionBannerNameEl = document.getElementById('df-top-action-name') as HTMLElement;
    this.actionBannerIconEl = document.getElementById('df-top-effect-icon') as HTMLElement;

    const josephEl = document.getElementById('df-hero-joseph') as HTMLElement;
    const rhogarEl = document.getElementById('df-hero-rhogar') as HTMLElement;
    const aliciaEl = document.getElementById('df-hero-alicia') as HTMLElement;

    this.heroes = [
      { id: 'joseph', name: 'JOSEPH', role: 'Paladino', maxHp: 110, hp: 110, maxMp: 20, mp: 16, x: 280, y: 200, weaponType: 'hammer', element: josephEl },
      { id: 'rhogar', name: 'RHOGAR', role: 'Draconato', maxHp: 120, hp: 120, maxMp: 25, mp: 15, x: 310, y: 285, weaponType: 'sword', element: rhogarEl },
      { id: 'alicia', name: 'ALICIA', role: 'Barda', maxHp: 85, hp: 76, maxMp: 30, mp: 30, x: 280, y: 355, weaponType: 'staff', element: aliciaEl }
    ];

    const golemTopEl = document.getElementById('df-enemy-golem-top') as HTMLElement;
    const lockTopEl = document.getElementById('df-lock-box-top') as HTMLElement;
    const golemBottomEl = document.getElementById('df-enemy-golem-bottom') as HTMLElement;
    const lockBottomEl = document.getElementById('df-lock-box-bottom') as HTMLElement;

    this.enemies = [
      {
        id: 'golem_top', name: 'Guardião Ancestral', maxHp: 220, hp: 220, x: 640, y: 185,
        countdown: 3, maxCountdown: 3,
        locks: [
          { type: 'sword', broken: false }, { type: 'hammer', broken: false },
          { type: 'sword', broken: false }, { type: 'hammer', broken: false }
        ],
        element: golemTopEl, lockBoxEl: lockTopEl
      },
      {
        id: 'golem_bottom', name: 'Guardião de Gelo', maxHp: 150, hp: 150, x: 700, y: 335,
        countdown: 1, maxCountdown: 2,
        locks: [
          { type: 'hammer', broken: false }, { type: 'sword', broken: false }
        ],
        element: golemBottomEl, lockBoxEl: lockBottomEl
      }
    ];

    this._updateStatusBars();
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Escape') {
      this.stop();
      return;
    }

    if (this.isExecutingTurn) return; // Sistema Tático não aceita inputs durante animações

    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.selectedMenuIndex = (this.selectedMenuIndex + 1) % this.menuActions.length;
      this._updateMenuSelection();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.selectedMenuIndex = (this.selectedMenuIndex - 1 + this.menuActions.length) % this.menuActions.length;
      this._updateMenuSelection();
    }

    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.activeHeroIndex = (this.activeHeroIndex + 1) % this.heroes.length;
      this._switchActiveHero();
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.activeHeroIndex = (this.activeHeroIndex - 1 + this.heroes.length) % this.heroes.length;
      this._switchActiveHero();
    }

    if (e.code === 'KeyZ' || e.code === 'Enter' || e.code === 'Space') {
      this._executePlayerAction();
    }
  }

  private _switchActiveHero(): void {
    const hero = this.heroes[this.activeHeroIndex];
    if (hero.hp <= 0) {
      // Pula heróis mortos
      this.activeHeroIndex = (this.activeHeroIndex + 1) % this.heroes.length;
      if (this.heroes.every(h => h.hp <= 0)) return; // Game Over
      this._switchActiveHero();
      return;
    }

    const nameEl = document.getElementById('df-active-hero-title');
    if (nameEl) nameEl.textContent = hero.name;

    // Destaca o card do herói
    this.heroes.forEach(h => {
      const card = document.getElementById(`df-card-${h.id}`);
      if (card) card.style.borderLeftColor = h.id === hero.id ? '#b22222' : '#5a4b3d';
    });

    this._updateContextMenuPosition();
    this._updateTopBanner();
  }

  private _updateContextMenuPosition(): void {
    const hero = this.heroes[this.activeHeroIndex];
    const menuX = hero.x + 90; // Adjust for 100x100 sprite
    const menuY = hero.y - 15; // Raised slightly to perfectly align with sprite

    gsap.to(this.contextMenuEl, {
      left: menuX,
      top: menuY,
      duration: 0.2,
      ease: 'power2.out'
    });
  }

  private _updateMenuSelection(): void {
    const items = this.contextMenuEl.querySelectorAll('.df-menu-item');
    items.forEach((item, idx) => {
      const isSelected = idx === this.selectedMenuIndex;
      item.classList.toggle('active', isSelected);

      const cursor = item.querySelector('.df-selection-cursor');
      if (cursor) cursor.remove();

      if (isSelected) {
        const newCursor = document.createElement('span');
        newCursor.className = 'df-selection-cursor';
        newCursor.textContent = '►';
        item.prepend(newCursor);
      }
    });

    this._updateTopBanner();
  }

  private _updateTopBanner(): void {
    const currentAction = this.menuActions[this.selectedMenuIndex];
    const currentHero = this.heroes[this.activeHeroIndex];

    if (currentAction === 'ATTACK') {
      this.actionBannerNameEl.textContent = 'Standard Strike';
      this.actionBannerIconEl.textContent = currentHero.weaponType === 'sword' ? '🗡️' : currentHero.weaponType === 'hammer' ? '🔨' : '✨';
    } else if (currentAction === 'SKILLS') {
      this.actionBannerNameEl.textContent = currentHero.id === 'rhogar' ? 'Dragon Cleave' : currentHero.id === 'joseph' ? "Reaper's Toll" : 'Lamentation';
      this.actionBannerIconEl.textContent = '⚡';
    } else if (currentAction === 'PENITENCE') {
      this.actionBannerNameEl.textContent = 'Unleash Penitence (Req: Max Tension)';
      this.actionBannerIconEl.textContent = '🩸';
    } else if (currentAction === 'ITEMS') {
      this.actionBannerNameEl.textContent = 'Use Consumable';
      this.actionBannerIconEl.textContent = '🧪';
    } else if (currentAction === 'SWAP') {
      this.actionBannerNameEl.textContent = 'Tactical Retreat';
      this.actionBannerIconEl.textContent = '🔄';
    }
  }

  private _executePlayerAction(): void {
    if (this.isExecutingTurn) return;
    
    // Pega o primeiro inimigo vivo
    const aliveEnemies = this.enemies.filter(e => e.hp > 0);
    if (aliveEnemies.length === 0) return; // Já venceu

    this.isExecutingTurn = true;
    const hero = this.heroes[this.activeHeroIndex];
    
    // Alvo simples por agora (o primeiro vivo)
    const targetEnemy = aliveEnemies[this.selectedTargetIndex % aliveEnemies.length];
    const action = this.menuActions[this.selectedMenuIndex];

    this.contextMenuEl.style.opacity = '0';

    const targetDashX = targetEnemy.x - 70;
    const originalX = hero.x;

    gsap.to(hero.element, {
      x: targetDashX - originalX,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        // Impacto e Tremor
        gsap.to(targetEnemy.element, {
          x: '+=12',
          duration: 0.05,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            // Quebra de Lock correspondente
            this._breakMatchingLock(targetEnemy, hero.weaponType);

            // Dano tático fixo
            const damage = action === 'PENITENCE' ? 120 : 35;
            targetEnemy.hp = Math.max(0, targetEnemy.hp - damage);
            this._showDamageNumber(targetEnemy.x + 35, targetEnemy.y - 20, damage, '#ff4444');

            if (targetEnemy.hp === 0) {
              this._playDeathAnimation(targetEnemy.element);
            }

            // Retorno
            gsap.to(hero.element, {
              x: 0,
              duration: 0.35,
              ease: 'power2.out',
              onComplete: () => {
                this.contextMenuEl.style.opacity = '1';
                this._advanceTurn();
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

      const badges = enemy.lockBoxEl.querySelectorAll('.df-lock-badge');
      badges.forEach((b, idx) => {
        if (enemy.locks[idx]?.broken) {
          b.classList.add('broken');
        }
      });

      const allBroken = enemy.locks.every(l => l.broken);
      if (allBroken) {
        const pwrLabel = enemy.lockBoxEl.querySelector('.df-lock-pwr-label') as HTMLElement;
        if (pwrLabel) {
          pwrLabel.textContent = 'STUNNED!';
          pwrLabel.style.color = '#ffcc00';
          pwrLabel.style.textShadow = '0 0 10px #ffcc00';
        }
      }
    }
  }

  private _showDamageNumber(x: number, y: number, damage: number, color: string): void {
    const dmgEl = document.createElement('div');
    dmgEl.className = 'floating-damage';
    dmgEl.textContent = `-${damage}`;
    dmgEl.style.left = `${x}px`;
    dmgEl.style.top = `${y}px`;
    dmgEl.style.color = color;
    dmgEl.style.fontFamily = "'Cinzel', serif";
    dmgEl.style.fontSize = '28px';
    dmgEl.style.fontWeight = 'bold';
    dmgEl.style.textShadow = '0 2px 5px #000';
    this.viewport.appendChild(dmgEl);

    gsap.to(dmgEl, {
      y: -40,
      opacity: 0,
      duration: 1.2,
      ease: 'power1.out',
      onComplete: () => dmgEl.remove()
    });
  }

  private _playDeathAnimation(element: HTMLElement): void {
    gsap.to(element, {
      opacity: 0,
      filter: 'grayscale(1) brightness(0)',
      y: '+=30',
      duration: 1,
      ease: 'power2.in',
      onComplete: () => {
        element.style.display = 'none';
      }
    });
  }

  // --- LOGICA DE IA E TURNOS --- //

  private _advanceTurn(): void {
    this._updateStatusBars();
    
    const aliveEnemies = this.enemies.filter(e => e.hp > 0);
    if (aliveEnemies.length === 0) {
      this.isExecutingTurn = false;
      this._showVictory();
      return;
    }

    // Gerencia o turno dos inimigos um a um
    this._processEnemyTurn(aliveEnemies, 0);
  }

  private _processEnemyTurn(aliveEnemies: EnemyLockUnit[], index: number): void {
    if (index >= aliveEnemies.length) {
      // Fim do turno dos inimigos, volta pro jogador
      this.isExecutingTurn = false;
      this._checkGameOver();
      return;
    }

    const enemy = aliveEnemies[index];
    enemy.countdown--;

    // Atualiza a UI do contador
    const cdEl = document.getElementById(`df-enemy-cd-${enemy.id.split('_')[1]}`);
    if (cdEl) cdEl.textContent = enemy.countdown.toString();

    if (enemy.countdown <= 0) {
      const allBroken = enemy.locks.every(l => l.broken);
      if (allBroken) {
        // Inimigo atordoado, reseta os locks e pula a ação
        this._showDamageNumber(enemy.x + 35, enemy.y - 40, 'STUNNED' as unknown as number, '#ffcc00');
        this._resetEnemyLocks(enemy);
        setTimeout(() => this._processEnemyTurn(aliveEnemies, index + 1), 1000);
      } else {
        // Inimigo Ataca!
        this._executeEnemyAction(enemy, () => {
          this._resetEnemyLocks(enemy);
          this._processEnemyTurn(aliveEnemies, index + 1);
        });
      }
    } else {
      // Apenas avançou o countdown, passa pro próximo
      this._processEnemyTurn(aliveEnemies, index + 1);
    }
  }

  private _resetEnemyLocks(enemy: EnemyLockUnit): void {
    enemy.countdown = enemy.maxCountdown;
    enemy.locks.forEach(l => l.broken = false);
    
    // Update UI
    const cdEl = document.getElementById(`df-enemy-cd-${enemy.id.split('_')[1]}`);
    if (cdEl) cdEl.textContent = enemy.countdown.toString();

    const pwrLabel = enemy.lockBoxEl.querySelector('.df-lock-pwr-label') as HTMLElement;
    if (pwrLabel) {
      pwrLabel.textContent = 'GUARD';
      pwrLabel.style.color = '#c9b39a';
      pwrLabel.style.textShadow = '0 2px 4px #000';
    }

    const badges = enemy.lockBoxEl.querySelectorAll('.df-lock-badge');
    badges.forEach(b => b.classList.remove('broken'));
  }

  private _executeEnemyAction(enemy: EnemyLockUnit, onComplete: () => void): void {
    const aliveHeroes = this.heroes.filter(h => h.hp > 0);
    if (aliveHeroes.length === 0) {
      onComplete();
      return;
    }

    // IA Simples: Escolhe herói aleatório
    const targetHero = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];

    const targetDashX = targetHero.x + 80;
    const originalX = enemy.x;

    gsap.to(enemy.element, {
      x: targetDashX - originalX,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        // Dano ao Herói
        const damage = 25;
        targetHero.hp = Math.max(0, targetHero.hp - damage);
        this._showDamageNumber(targetHero.x + 35, targetHero.y - 20, damage, '#ffffff');

        // Tremor no Herói
        gsap.to(targetHero.element, {
          x: '-=10',
          duration: 0.05,
          yoyo: true,
          repeat: 5
        });

        this._updateStatusBars();

        if (targetHero.hp === 0) {
           this._playDeathAnimation(targetHero.element);
           if(this.activeHeroIndex === this.heroes.indexOf(targetHero)){
             // Se o ativo morreu, tenta passar pra frente
             setTimeout(() => this._switchActiveHero(), 500);
           }
        }

        // Volta o monstro
        gsap.to(enemy.element, {
          x: 0,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: onComplete
        });
      }
    });
  }

  private _updateStatusBars(): void {
    this.heroes.forEach(h => {
      const hpFill = document.getElementById(`df-hp-fill-${h.id}`);
      const hpVal = document.getElementById(`df-hp-val-${h.id}`);
      if (hpFill && hpVal) {
        const pct = (h.hp / h.maxHp) * 100;
        hpFill.style.width = `${pct}%`;
        hpVal.textContent = h.hp.toString();
        if(h.hp === 0){
            document.getElementById(`df-card-${h.id}`)!.style.opacity = '0.5';
        }
      }
    });
  }

  private _checkGameOver(): void {
    const aliveHeroes = this.heroes.filter(h => h.hp > 0);
    if (aliveHeroes.length === 0) {
      this.isExecutingTurn = true;
      const go = document.createElement('div');
      go.textContent = 'DEFEAT';
      go.style.position = 'absolute';
      go.style.top = '40%';
      go.style.left = '50%';
      go.style.transform = 'translate(-50%, -50%)';
      go.style.color = '#8b0000';
      go.style.fontFamily = "'Cinzel', serif";
      go.style.fontSize = '80px';
      go.style.fontWeight = 'bold';
      go.style.textShadow = '0 0 20px #000';
      this.viewport.appendChild(go);
    }
  }

  private _showVictory(): void {
    const go = document.createElement('div');
    go.textContent = 'VICTORY';
    go.style.position = 'absolute';
    go.style.top = '40%';
    go.style.left = '50%';
    go.style.transform = 'translate(-50%, -50%)';
    go.style.color = '#d4a359';
    go.style.fontFamily = "'Cinzel', serif";
    go.style.fontSize = '80px';
    go.style.fontWeight = 'bold';
    go.style.textShadow = '0 0 20px #000';
    this.viewport.appendChild(go);
  }
}
