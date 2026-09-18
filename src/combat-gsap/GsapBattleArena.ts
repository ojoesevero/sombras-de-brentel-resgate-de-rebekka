import gsap from 'gsap';
import './combat-gsap.css';

export interface Combatant {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  isEnemy: boolean;
  spriteUrl: string;
}

export class GsapBattleArena {
  private container: HTMLElement;
  private onExitCallback?: () => void;

  private player: Combatant = {
    id: 'hero_rhogar',
    name: 'Rhogar Tordan',
    level: 4,
    hp: 100,
    maxHp: 100,
    resource: 35,
    maxResource: 50,
    isEnemy: false,
    spriteUrl: '/assets/sprites/spr_rhogar_tordan_front.png'
  };

  private enemies: Combatant[] = [
    {
      id: 'enemy_1',
      name: 'Gladiador de Alvorada',
      level: 3,
      hp: 55,
      maxHp: 55,
      resource: 0,
      maxResource: 20,
      isEnemy: true,
      spriteUrl: '/assets/sprites/spr_gladiador_arena_front.png'
    },
    {
      id: 'enemy_2',
      name: 'Gladiador de Crepúsculo',
      level: 4,
      hp: 70,
      maxHp: 70,
      resource: 0,
      maxResource: 20,
      isEnemy: true,
      spriteUrl: '/assets/sprites/spr_gladiador_arena_front.png'
    }
  ];

  private selectedEnemyIndex: number = 0;
  private selectedActionIndex: number = 0;
  private potionsCount: number = 3;
  private goldEarned: number = 0;
  private isPlayerDefending: boolean = false;
  private isBusy: boolean = false;
  private boundKeyDown: (e: KeyboardEvent) => void;

  private actions = [
    {
      id: 'attack',
      key: '1',
      icon: '⚔️',
      title: 'Ataque Físico',
      cost: 'Gera +5 Recurso',
      help: 'Golpe direto com a maça pesada causando dano físico moderado.'
    },
    {
      id: 'skill',
      key: '2',
      icon: '🔥',
      title: 'Fogo Draconiano',
      cost: 'Custo: 20 Recurso',
      help: 'Sopro de chamas ancestrais devastador com alto dano de fogo.'
    },
    {
      id: 'item',
      key: '3',
      icon: '🧪',
      title: 'Poção de Cura',
      cost: 'Restaura +40 HP',
      help: 'Consome uma poção do inventário para recuperar pontos de vida.'
    },
    {
      id: 'defend',
      key: '4',
      icon: '🛡️',
      title: 'Postura Defensiva',
      cost: 'Gera +15 Recurso',
      help: 'Assume postura fechada, reduzindo pela metade o dano do próximo turno.'
    },
    {
      id: 'flee',
      key: '5',
      icon: '🏃',
      title: 'Recuo Tático',
      cost: 'Sem Custo',
      help: 'Recua estrategicamente de volta à Taverna Cauda do Dragão.'
    }
  ];

  constructor(containerId: string = 'battle-gsap-container') {
    const el = document.getElementById(containerId);
    if (!el) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    } else {
      this.container = el;
    }

    this.boundKeyDown = this._handleKeyDown.bind(this);
  }

  public start(onExit?: () => void): void {
    this.onExitCallback = onExit;
    this.isBusy = false;
    this.isPlayerDefending = false;
    this.player.hp = this.player.maxHp;
    this.player.resource = 35;
    this.potionsCount = 3;
    this.selectedEnemyIndex = 0;
    this.selectedActionIndex = 0;

    this.enemies.forEach((enemy) => {
      enemy.hp = enemy.maxHp;
    });

    this._renderDOM();
    this.container.classList.add('active');
    window.addEventListener('keydown', this.boundKeyDown);

    // Entrada cinematográfica da tela com GSAP
    gsap.fromTo(
      this.container.querySelector('.arena-stage'),
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );

    this._updateUI();
    this._setTurnMessage('TURNO DO JOGADOR: Escolha uma ação tática ou use as teclas [1-5].');
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
      <div class="arena-backdrop"></div>
      <div class="arena-vignette"></div>
      <div class="arena-flash-overlay" id="flash-overlay"></div>
      <div class="combat-text-container" id="combat-text-container"></div>

      <div class="arena-stage">
        <!-- Topo da Arena -->
        <header class="arena-header">
          <div class="arena-title-wrap">
            <span class="arena-badge">Módulo GSAP + CSS3</span>
            <h1 class="arena-title">Arena dos Centuriões • Combate Tático</h1>
          </div>
          <div class="arena-header-controls">
            <button class="btn-header" id="btn-restart-battle">🔄 Reiniciar</button>
            <button class="btn-header" id="btn-exit-battle">🚪 Voltar ao Menu [ESC]</button>
          </div>
        </header>

        <!-- Banner Central de Turno -->
        <div class="combat-turn-banner">
          <div class="turn-pulse-dot"></div>
          <span class="combat-turn-text" id="turn-banner-text">Iniciando combate...</span>
        </div>

        <!-- Campo de Combate: Jogador vs Inimigos -->
        <main class="combat-field">
          <!-- Jogador (Rhogar) -->
          <div class="combatant-party-player">
            <div class="hero-unit" id="hero-unit">
              <div class="hero-visual-wrap" id="hero-visual">
                <div class="hero-shadow"></div>
                <div class="hero-aura"></div>
                <img class="hero-sprite" src="${this.player.spriteUrl}" alt="${this.player.name}" />
                <div class="hero-weapon-fx"></div>
              </div>
              <div class="combatant-card">
                <div class="combatant-header">
                  <span class="combatant-name">${this.player.name}</span>
                  <span class="combatant-level">Nível ${this.player.level} Draconato</span>
                </div>
                <div class="stat-bar-group">
                  <div class="stat-bar-container">
                    <div class="stat-bar-labels">
                      <span class="stat-label-hp">Pontos de Vida (HP)</span>
                      <span id="hero-hp-text">${this.player.hp}/${this.player.maxHp}</span>
                    </div>
                    <div class="stat-track">
                      <div class="stat-fill-hp" id="hero-hp-bar" style="width: 100%"></div>
                    </div>
                  </div>
                  <div class="stat-bar-container">
                    <div class="stat-bar-labels">
                      <span class="stat-label-resource">Fúria / Recurso</span>
                      <span id="hero-resource-text">${this.player.resource}/${this.player.maxResource}</span>
                    </div>
                    <div class="stat-track">
                      <div class="stat-fill-resource" id="hero-resource-bar" style="width: 70%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Adversários -->
          <div class="combatant-party-enemies" id="enemies-container">
            ${this.enemies
              .map(
                (enemy, idx) => `
              <div class="enemy-unit ${idx === this.selectedEnemyIndex ? 'selected' : ''}" id="enemy-unit-${idx}" data-index="${idx}">
                <div class="enemy-target-marker">▼</div>
                <div class="enemy-visual-wrap" id="enemy-visual-${idx}">
                  <div class="hero-shadow"></div>
                  <img class="enemy-sprite" src="${enemy.spriteUrl}" alt="${enemy.name}" />
                </div>
                <div class="combatant-card" style="width: 200px">
                  <div class="combatant-header">
                    <span class="combatant-name" style="font-size: 0.9rem">${enemy.name}</span>
                  </div>
                  <div class="stat-bar-group">
                    <div class="stat-bar-container">
                      <div class="stat-bar-labels">
                        <span class="stat-label-hp">HP</span>
                        <span id="enemy-hp-text-${idx}">${enemy.hp}/${enemy.maxHp}</span>
                      </div>
                      <div class="stat-track">
                        <div class="stat-fill-hp" id="enemy-hp-bar-${idx}" style="width: 100%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </main>

        <!-- Painel Inferior de Ações Táticas -->
        <footer class="combat-bottom-panel">
          <div class="action-cards-grid" id="action-cards-grid">
            ${this.actions
              .map(
                (act, idx) => `
              <button class="action-card ${idx === this.selectedActionIndex ? 'selected' : ''}" id="action-btn-${idx}" data-index="${idx}">
                <span class="action-key-badge">[${act.key}]</span>
                <span class="action-icon">${act.icon}</span>
                <span class="action-title">${act.title}</span>
                <span class="action-cost" id="action-cost-${idx}">${act.cost}</span>
              </button>
            `
              )
              .join('')}
          </div>
          <div class="action-help-banner">
            <span id="action-help-text">${this.actions[this.selectedActionIndex].help}</span>
            <span class="action-help-tips">💡 Dica: Use Teclado [1-5], [Setas] para escolher alvo e [Enter] ou [Espaço] para agir.</span>
          </div>
        </footer>
      </div>

      <!-- Modal de Vitória / Derrota -->
      <div class="combat-result-modal" id="combat-result-modal">
        <div class="result-card">
          <h2 class="result-title" id="result-title">VITÓRIA GLORIOSA!</h2>
          <p id="result-description">Os gladiadores de Brentel foram derrotados pela força draconiana.</p>
          <div class="result-rewards" id="result-rewards">
            <span class="reward-item">🪙 +45 Ouro</span>
            <span class="reward-item">🧪 +1 Poção de Cura</span>
            <span class="reward-item">⭐ +80 EXP</span>
          </div>
          <div class="result-buttons">
            <button class="btn-result-primary" id="btn-result-rematch">Jogar Novamente</button>
            <button class="btn-result-primary" id="btn-result-exit" style="background: rgba(255,255,255,0.12); color:#fff;">Voltar ao Menu</button>
          </div>
        </div>
      </div>
    `;

    // Event Listeners de Botões
    document.getElementById('btn-exit-battle')?.addEventListener('click', () => this.stop());
    document.getElementById('btn-restart-battle')?.addEventListener('click', () => this.start(this.onExitCallback));
    document.getElementById('btn-result-rematch')?.addEventListener('click', () => this.start(this.onExitCallback));
    document.getElementById('btn-result-exit')?.addEventListener('click', () => this.stop());

    // Cliques em Inimigos
    this.enemies.forEach((_, idx) => {
      document.getElementById(`enemy-unit-${idx}`)?.addEventListener('click', () => {
        if (!this.enemies[idx] || this.enemies[idx].hp <= 0) return;
        this.selectedEnemyIndex = idx;
        this._updateUI();
      });
    });

    // Cliques em Ações
    this.actions.forEach((_, idx) => {
      document.getElementById(`action-btn-${idx}`)?.addEventListener('click', () => {
        this.selectedActionIndex = idx;
        this._updateUI();
        this._executePlayerAction();
      });
    });
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this.isBusy) return;

    if (e.key === 'Escape') {
      this.stop();
      return;
    }

    if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < this.actions.length) {
        this.selectedActionIndex = idx;
        this._updateUI();
        this._executePlayerAction();
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Tab') {
      e.preventDefault();
      this._cycleTarget(1);
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      this._cycleTarget(-1);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'z') {
      e.preventDefault();
      this._executePlayerAction();
    }
  }

  private _cycleTarget(direction: number): void {
    const aliveIndices = this.enemies
      .map((e, idx) => (e.hp > 0 ? idx : -1))
      .filter((idx) => idx !== -1);

    if (aliveIndices.length === 0) return;

    const currentPos = aliveIndices.indexOf(this.selectedEnemyIndex);
    let nextPos = currentPos + direction;
    if (nextPos >= aliveIndices.length) nextPos = 0;
    if (nextPos < 0) nextPos = aliveIndices.length - 1;

    this.selectedEnemyIndex = aliveIndices[nextPos];
    this._updateUI();
  }

  private _updateUI(): void {
    // Atualizar Barra de HP e Recurso de Rhogar
    const heroHpBar = document.getElementById('hero-hp-bar');
    const heroHpText = document.getElementById('hero-hp-text');
    const heroResourceBar = document.getElementById('hero-resource-bar');
    const heroResourceText = document.getElementById('hero-resource-text');

    if (heroHpBar && heroHpText) {
      const pct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
      heroHpBar.style.width = `${pct}%`;
      heroHpText.textContent = `${this.player.hp}/${this.player.maxHp}`;
    }

    if (heroResourceBar && heroResourceText) {
      const pct = Math.max(0, Math.min(100, (this.player.resource / this.player.maxResource) * 100));
      heroResourceBar.style.width = `${pct}%`;
      heroResourceText.textContent = `${this.player.resource}/${this.player.maxResource}`;
    }

    // Atualizar Inimigos
    this.enemies.forEach((enemy, idx) => {
      const unit = document.getElementById(`enemy-unit-${idx}`);
      const hpBar = document.getElementById(`enemy-hp-bar-${idx}`);
      const hpText = document.getElementById(`enemy-hp-text-${idx}`);

      if (unit) {
        if (enemy.hp <= 0) {
          unit.classList.add('is-dead');
          unit.classList.remove('selected');
        } else {
          unit.classList.remove('is-dead');
          if (idx === this.selectedEnemyIndex) {
            unit.classList.add('selected');
          } else {
            unit.classList.remove('selected');
          }
        }
      }

      if (hpBar && hpText) {
        const pct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
        hpBar.style.width = `${pct}%`;
        hpText.textContent = `${enemy.hp}/${enemy.maxHp}`;
      }
    });

    // Se o alvo selecionado morreu, muda para o outro vivo
    if (this.enemies[this.selectedEnemyIndex]?.hp <= 0) {
      const firstAlive = this.enemies.findIndex((e) => e.hp > 0);
      if (firstAlive !== -1) {
        this.selectedEnemyIndex = firstAlive;
        this._updateUI();
        return;
      }
    }

    // Atualizar Cards de Ação
    this.actions.forEach((_, idx) => {
      const btn = document.getElementById(`action-btn-${idx}`);
      if (btn) {
        if (idx === this.selectedActionIndex) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }

        // Desativar se sem recurso ou sem poção
        if (idx === 1 && this.player.resource < 20) {
          btn.classList.add('disabled');
        } else if (idx === 2 && this.potionsCount <= 0) {
          btn.classList.add('disabled');
        } else {
          btn.classList.remove('disabled');
        }
      }
    });

    // Atualizar custo da poção com quantidade
    const potionCostEl = document.getElementById('action-cost-2');
    if (potionCostEl) {
      potionCostEl.textContent = `Disponíveis: x${this.potionsCount}`;
    }

    // Atualizar texto de ajuda
    const helpText = document.getElementById('action-help-text');
    if (helpText && this.actions[this.selectedActionIndex]) {
      helpText.textContent = this.actions[this.selectedActionIndex].help;
    }
  }

  private _setTurnMessage(msg: string): void {
    const textEl = document.getElementById('turn-banner-text');
    if (textEl) {
      textEl.textContent = msg;
    }
  }

  /* ==========================================================================
     Execução das Ações de Combate com Linha do Tempo GSAP
     ========================================================================== */

  private _executePlayerAction(): void {
    if (this.isBusy) return;

    const action = this.actions[this.selectedActionIndex];
    if (!action) return;

    // Validações
    if (action.id === 'skill' && this.player.resource < 20) {
      this._triggerScreenFlash('red');
      this._setTurnMessage('Recurso insuficiente para Fogo Draconiano! (Necessário: 20)');
      return;
    }

    if (action.id === 'item' && this.potionsCount <= 0) {
      this._triggerScreenFlash('red');
      this._setTurnMessage('Você não tem mais Poções de Cura no inventário!');
      return;
    }

    this.isBusy = true;
    const targetEnemy = this.enemies[this.selectedEnemyIndex];

    switch (action.id) {
      case 'attack':
        this._animateHeroPhysicalAttack(targetEnemy);
        break;
      case 'skill':
        this._animateHeroDragonSkill(targetEnemy);
        break;
      case 'item':
        this._animateHeroHealItem();
        break;
      case 'defend':
        this._animateHeroDefend();
        break;
      case 'flee':
        this._animateHeroFlee();
        break;
    }
  }

  /* 1. Ataque Físico Procedural com GSAP */
  private _animateHeroPhysicalAttack(target: Combatant): void {
    const heroVisual = document.getElementById('hero-visual');
    const targetVisual = document.getElementById(`enemy-visual-${this.selectedEnemyIndex}`);
    if (!heroVisual || !targetVisual) return;

    this._setTurnMessage(`Rhogar avança empunhando sua maça de guerra contra ${target.name}!`);

    const dmg = Math.floor(18 + Math.random() * 8);
    const isCrit = Math.random() < 0.25;
    const finalDmg = isCrit ? Math.floor(dmg * 1.5) : dmg;

    const tl = gsap.timeline({
      onComplete: () => {
        target.hp = Math.max(0, target.hp - finalDmg);
        this.player.resource = Math.min(this.player.maxResource, this.player.resource + 5);
        this._updateUI();

        if (this._checkBattleOutcome()) return;

        // Turno dos Inimigos
        setTimeout(() => this._executeEnemyTurns(), 600);
      }
    });

    // Antecipação do golpe
    tl.to(heroVisual, {
      x: -25,
      rotation: -6,
      duration: 0.18,
      ease: 'power1.out'
    });

    // Avanço rápido e impacto
    tl.to(heroVisual, {
      x: 180,
      scale: 1.15,
      rotation: 14,
      duration: 0.22,
      ease: 'power3.in',
      onComplete: () => {
        this._triggerScreenShake(isCrit ? 'heavy' : 'light');
        this._triggerScreenFlash(isCrit ? 'gold' : 'red');
        this._spawnFloatingCombatText(targetVisual, finalDmg, isCrit ? 'critical' : 'normal');

        // Reação de impacto do inimigo (knockback elástico)
        gsap.to(targetVisual, {
          x: 40,
          rotation: -12,
          duration: 0.08,
          yoyo: true,
          repeat: 3,
          ease: 'power1.inOut'
        });
      }
    });

    // Retorno elástico de Rhogar
    tl.to(heroVisual, {
      x: 0,
      scale: 1,
      rotation: 0,
      duration: 0.38,
      ease: 'back.out(1.8)'
    });
  }

  /* 2. Habilidade Especial: Fogo Draconiano */
  private _animateHeroDragonSkill(target: Combatant): void {
    const heroVisual = document.getElementById('hero-visual');
    const targetVisual = document.getElementById(`enemy-visual-${this.selectedEnemyIndex}`);
    if (!heroVisual || !targetVisual) return;

    this.player.resource -= 20;
    this._setTurnMessage('Rhogar canaliza a fúria ancestral do fogo draconiano!');

    const baseDmg = Math.floor(34 + Math.random() * 12);

    const tl = gsap.timeline({
      onComplete: () => {
        target.hp = Math.max(0, target.hp - baseDmg);
        this._updateUI();

        if (this._checkBattleOutcome()) return;
        setTimeout(() => this._executeEnemyTurns(), 700);
      }
    });

    // Levitação e brilho
    tl.to(heroVisual, {
      y: -35,
      scale: 1.2,
      duration: 0.3,
      ease: 'power2.out',
      onStart: () => {
        this._triggerScreenFlash('gold');
      }
    });

    // Onda de impacto com explosão de fogo
    tl.to(heroVisual, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: 'bounce.out',
      onComplete: () => {
        this._triggerScreenShake('heavy');
        this._triggerScreenFlash('gold');
        this._spawnFloatingCombatText(targetVisual, `🔥 ${baseDmg}`, 'critical');

        // Todos os inimigos sofrem tremor
        this.enemies.forEach((_, i) => {
          const ev = document.getElementById(`enemy-visual-${i}`);
          if (ev) {
            gsap.to(ev, {
              y: -20,
              duration: 0.12,
              yoyo: true,
              repeat: 3,
              ease: 'power2.inOut'
            });
          }
        });
      }
    });
  }

  /* 3. Poção de Cura */
  private _animateHeroHealItem(): void {
    const heroVisual = document.getElementById('hero-visual');
    if (!heroVisual) return;

    this.potionsCount--;
    const healAmount = 40;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);

    this._setTurnMessage(`Rhogar consome uma Poção de Cura restaurando +${healAmount} HP!`);

    gsap.timeline({
      onComplete: () => {
        this._updateUI();
        setTimeout(() => this._executeEnemyTurns(), 600);
      }
    })
      .to(heroVisual, {
        scale: 1.15,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
        onStart: () => {
          this._triggerScreenFlash('green');
          this._spawnFloatingCombatText(heroVisual, `+${healAmount} HP`, 'heal');
        }
      });
  }

  /* 4. Postura Defensiva */
  private _animateHeroDefend(): void {
    const heroVisual = document.getElementById('hero-visual');
    if (!heroVisual) return;

    this.isPlayerDefending = true;
    this.player.resource = Math.min(this.player.maxResource, this.player.resource + 15);
    this._setTurnMessage('Rhogar firma os pés e assume postura de guarda impenetrável (+15 Recurso)!');

    gsap.timeline({
      onComplete: () => {
        this._updateUI();
        setTimeout(() => this._executeEnemyTurns(), 600);
      }
    })
      .to(heroVisual, {
        x: -15,
        scaleY: 0.92,
        scaleX: 1.08,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          this._spawnFloatingCombatText(heroVisual, '🛡️ DEFESA', 'shield');
        }
      })
      .to(heroVisual, {
        x: 0,
        scaleY: 1,
        scaleX: 1,
        duration: 0.25,
        ease: 'power2.out'
      });
  }

  /* 5. Recuo Tático */
  private _animateHeroFlee(): void {
    const heroVisual = document.getElementById('hero-visual');
    if (!heroVisual) return;

    this._setTurnMessage('Rhogar executa recuo tático para recompor forças na taverna...');
    gsap.to(heroVisual, {
      x: -400,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        this.stop();
      }
    });
  }

  /* ==========================================================================
     Turno dos Inimigos (Gladiadores Contra-Atacam)
     ========================================================================== */

  private _executeEnemyTurns(): void {
    const livingEnemies = this.enemies.filter((e) => e.hp > 0);
    if (livingEnemies.length === 0) {
      this._handleVictory();
      return;
    }

    this._setTurnMessage('TURNO INIMIGO: Os gladiadores atacam!');

    // Executa contra-ataque em cascata com GSAP
    let delay = 0;
    livingEnemies.forEach((enemy) => {
      setTimeout(() => {
        if (this.player.hp <= 0) return;
        this._animateEnemyAttack(enemy);
      }, delay);
      delay += 800;
    });

    setTimeout(() => {
      if (this.player.hp > 0) {
        this.isBusy = false;
        this.isPlayerDefending = false;
        this._setTurnMessage('SEU TURNO: Selecione sua próxima ação.');
      }
    }, delay + 200);
  }

  private _animateEnemyAttack(enemy: Combatant): void {
    const enemyIdx = this.enemies.indexOf(enemy);
    const enemyVisual = document.getElementById(`enemy-visual-${enemyIdx}`);
    const heroVisual = document.getElementById('hero-visual');
    if (!enemyVisual || !heroVisual) return;

    let dmg = Math.floor(10 + Math.random() * 6);
    if (this.isPlayerDefending) {
      dmg = Math.floor(dmg * 0.5);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.player.hp = Math.max(0, this.player.hp - dmg);
        this._updateUI();

        if (this.player.hp <= 0) {
          this._handleDefeat();
        }
      }
    });

    // Inimigo avança
    tl.to(enemyVisual, {
      x: -160,
      scale: 1.15,
      rotation: -10,
      duration: 0.22,
      ease: 'power3.in',
      onComplete: () => {
        this._triggerScreenShake('light');
        this._triggerScreenFlash('red');
        this._spawnFloatingCombatText(heroVisual, `-${dmg}`, 'normal');

        // Rhogar reage ao dano
        gsap.to(heroVisual, {
          x: -30,
          rotation: -8,
          duration: 0.08,
          yoyo: true,
          repeat: 3
        });
      }
    });

    // Inimigo retorna
    tl.to(enemyVisual, {
      x: 0,
      scale: 1,
      rotation: 0,
      duration: 0.35,
      ease: 'back.out(1.8)'
    });
  }

  /* ==========================================================================
     Verificação de Fim de Combate (Vitória / Derrota)
     ========================================================================== */

  private _checkBattleOutcome(): boolean {
    const allEnemiesDead = this.enemies.every((e) => e.hp <= 0);
    if (allEnemiesDead) {
      this._handleVictory();
      return true;
    }
    return false;
  }

  private _handleVictory(): void {
    this.isBusy = true;
    this.goldEarned = 45;
    this._setTurnMessage('VITÓRIA GLORIOSA! Arena conquistada!');

    setTimeout(() => {
      const modal = document.getElementById('combat-result-modal');
      const title = document.getElementById('result-title');
      const desc = document.getElementById('result-description');
      const rewards = document.getElementById('result-rewards');

      if (modal && title && desc && rewards) {
        title.textContent = 'VITÓRIA GLORIOSA!';
        title.className = 'result-title';
        desc.textContent = 'Os gladiadores reconhecem sua bravura. Você recebe ouro e mantimentos.';
        rewards.innerHTML = `
          <span class="reward-item">🪙 +${this.goldEarned} Ouro</span>
          <span class="reward-item">🧪 +1 Poção de Cura</span>
          <span class="reward-item">⭐ +80 EXP</span>
        `;
        rewards.style.display = 'flex';
        modal.classList.add('active');
      }
    }, 600);
  }

  private _handleDefeat(): void {
    this.isBusy = true;
    this._setTurnMessage('DERROTA! Rhogar sucumbiu aos golpes na arena.');

    setTimeout(() => {
      const modal = document.getElementById('combat-result-modal');
      const title = document.getElementById('result-title');
      const desc = document.getElementById('result-description');
      const rewards = document.getElementById('result-rewards');

      if (modal && title && desc && rewards) {
        title.textContent = 'DERROTA NA ARENA';
        title.className = 'result-title defeat';
        desc.textContent = 'Rhogar foi subjugado pelos combatentes. Recue para a taverna para descansar.';
        rewards.style.display = 'none';
        modal.classList.add('active');
      }
    }, 600);
  }

  /* ==========================================================================
     Efeitos de Impacto (Screen Shake, Flashes e Números Flutuantes)
     ========================================================================== */

  private _triggerScreenShake(intensity: 'light' | 'heavy'): void {
    const stage = this.container.querySelector('.arena-stage');
    if (!stage) return;

    stage.classList.remove('shake-screen-light', 'shake-screen-heavy');
    // Forçar reflow para reiniciar animação
    void (stage as HTMLElement).offsetWidth;

    stage.classList.add(intensity === 'heavy' ? 'shake-screen-heavy' : 'shake-screen-light');

    setTimeout(() => {
      stage.classList.remove('shake-screen-light', 'shake-screen-heavy');
    }, 500);
  }

  private _triggerScreenFlash(type: 'red' | 'gold' | 'green'): void {
    const overlay = document.getElementById('flash-overlay');
    if (!overlay) return;

    overlay.className = `arena-flash-overlay flash-${type}`;
    setTimeout(() => {
      overlay.className = 'arena-flash-overlay';
    }, 160);
  }

  private _spawnFloatingCombatText(
    targetEl: HTMLElement,
    text: string | number,
    type: 'normal' | 'critical' | 'heal' | 'shield'
  ): void {
    const container = document.getElementById('combat-text-container');
    if (!container) return;

    const rect = targetEl.getBoundingClientRect();
    const spawnX = rect.left + rect.width / 2 + (Math.random() * 40 - 20);
    const spawnY = rect.top + rect.height * 0.4;

    const popup = document.createElement('div');
    popup.className = `floating-dmg-number ${type}`;
    popup.textContent = `${text}`;
    popup.style.left = `${spawnX}px`;
    popup.style.top = `${spawnY}px`;
    container.appendChild(popup);

    // Física e salto com GSAP
    gsap.fromTo(
      popup,
      {
        scale: 0.5,
        opacity: 0,
        y: 0
      },
      {
        scale: type === 'critical' ? 1.4 : 1.1,
        opacity: 1,
        y: -50,
        duration: 0.22,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(popup, {
            y: -95,
            opacity: 0,
            duration: 0.45,
            ease: 'power2.in',
            onComplete: () => {
              popup.remove();
            }
          });
        }
      }
    );
  }
}
