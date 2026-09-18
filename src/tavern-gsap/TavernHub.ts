import gsap from 'gsap';
import './tavern-hub.css';
import { DialogueSystem, DialogueLine } from './DialogueSystem';
import { GsapBattleArena } from '../combat-gsap/GsapBattleArena';
import { globalSaveService } from '../services/SaveService';
import { GameStatePayload } from '../types/game.types';

export class TavernHub {
  private container: HTMLElement;
  private dialogueSystem: DialogueSystem;
  private onExitCallback?: () => void;

  // Estado do Jogador
  private gold: number = 30;
  private potionsCount: number = 2;
  private questCompleted: boolean = false;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(containerId: string = 'tavern-gsap-container') {
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      document.body.appendChild(el);
    }
    this.container = el;
    this.dialogueSystem = new DialogueSystem();
    this.boundKeyDown = this._handleKeyDown.bind(this);
  }

  public start(onExit?: () => void): void {
    this.onExitCallback = onExit;

    // Tenta carregar dados existentes de save
    const saved = globalSaveService.load<GameStatePayload>();
    if (saved && saved.data) {
      this.gold = saved.data.inventoryData.gold || 30;
      const potionItem = saved.data.inventoryData.items.find(
        (i) => i.id === 'test_item_heal' || i.id === 'pocao_cura'
      );
      if (potionItem) {
        this.potionsCount = potionItem.quantity;
      }
      const quest = saved.data.questsData?.['test_quest_verification'];
      this.questCompleted = quest?.status === 'completed';
    }

    this._renderDOM();
    this.container.classList.add('active');
    window.addEventListener('keydown', this.boundKeyDown);

    // Fade in suave do cenário
    gsap.fromTo(
      this.container.querySelector('.tavern-stage'),
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
    );

    this._updateHUD();
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
      <div class="tavern-backdrop"></div>
      <div class="tavern-warm-vignette"></div>
      <div class="save-toast" id="save-toast">✓ Progresso Salvo com Sucesso no Tomo Arcano!</div>

      <!-- Barra Superior / HUD -->
      <header class="tavern-top-hud">
        <div class="tavern-info-group">
          <div class="tavern-location-badge">
            <span class="tavern-location-title">Taverna Cauda do Dragão</span>
            <span class="tavern-location-sub">Distrito de Rastphen • Território Livre</span>
          </div>
          <div class="tavern-stats-strip">
            <div class="stat-pill gold">
              <span>🪙</span> <span id="hud-gold-text">${this.gold}g</span>
            </div>
            <div class="stat-pill potion">
              <span>🧪</span> <span id="hud-potion-text">x${this.potionsCount} Poções</span>
            </div>
            <div class="stat-pill quest">
              <span>📜</span> <span id="hud-quest-text">Missão: ${this.questCompleted ? 'Pronto para a Floresta' : 'Falar com Dona Hilda'}</span>
            </div>
          </div>
        </div>
        <div class="tavern-hud-buttons">
          <button class="btn-tavern-hud" id="btn-open-bag">🎒 Mochila [I]</button>
          <button class="btn-tavern-hud" id="btn-save-game">💾 Salvar [S]</button>
          <button class="btn-tavern-hud" id="btn-exit-tavern">🚪 Menu [ESC]</button>
        </div>
      </header>

      <!-- Palco Central com Pontos de Interesse (Hotspots) -->
      <main class="tavern-stage">
        <!-- Hotspot: Dona Hilda (Balcão) -->
        <div class="hotspot-node" id="hotspot-hilda">
          <div class="hotspot-ring">💬</div>
          <div class="hotspot-card">
            <span class="hotspot-title">Dona Hilda</span>
            <span class="hotspot-sub">Balcão da Taverna [1]</span>
          </div>
        </div>

        <!-- Hotspot: Tomo de Salvamento -->
        <div class="hotspot-node" id="hotspot-save">
          <div class="hotspot-ring">📖</div>
          <div class="hotspot-card">
            <span class="hotspot-title">Tomo de Salvamento</span>
            <span class="hotspot-sub">Runa de Registro [2]</span>
          </div>
        </div>

        <!-- Hotspot: Saída para a Arena de Treinamento -->
        <div class="hotspot-node" id="hotspot-arena">
          <div class="hotspot-ring" style="border-color: #e74c3c; box-shadow: 0 0 18px rgba(231,76,60,0.6);">⚔️</div>
          <div class="hotspot-card" style="border-color: rgba(231,76,60,0.5);">
            <span class="hotspot-title">Arena dos Centuriões</span>
            <span class="hotspot-sub">Treino de Combate [3]</span>
          </div>
        </div>

        <!-- Hotspot: Mochila de Mantimentos -->
        <div class="hotspot-node" id="hotspot-inventory">
          <div class="hotspot-ring" style="border-color: #3498db; box-shadow: 0 0 18px rgba(52,152,219,0.5);">🎒</div>
          <div class="hotspot-card" style="border-color: rgba(52,152,219,0.5);">
            <span class="hotspot-title">Mochila de Viagem</span>
            <span class="hotspot-sub">Itens & Equipamentos [4]</span>
          </div>
        </div>
      </main>

      <!-- Modal de Inventário e Missões -->
      <div class="tavern-modal-overlay" id="inventory-modal">
        <div class="tavern-modal-card">
          <div class="tavern-modal-header">
            <h2 class="tavern-modal-title">Mochila de Rhogar Tordan</h2>
            <button class="btn-modal-close" id="btn-close-inventory">✕</button>
          </div>
          <div style="display: flex; gap: 2rem;">
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.8rem;">
              <h3 style="font-size: 0.95rem; color: #ffd700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3rem;">Equipamento Atual</h3>
              <div style="background: rgba(0,0,0,0.4); padding: 0.6rem 0.9rem; border-radius: 8px;">
                <p style="font-weight: 700; color: #fff;">⚔️ Maça de Guerra Pesada</p>
                <p style="font-size: 0.78rem; color: #aaa;">Dano Físico: 18-26 • Escala com Fúria</p>
              </div>
              <div style="background: rgba(0,0,0,0.4); padding: 0.6rem 0.9rem; border-radius: 8px;">
                <p style="font-weight: 700; color: #fff;">🛡️ Placas Draconianas de Bronze</p>
                <p style="font-size: 0.78rem; color: #aaa;">Defesa Física: +15 • Absorção Passiva</p>
              </div>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.8rem;">
              <h3 style="font-size: 0.95rem; color: #ffd700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3rem;">Bolsa de Consumíveis</h3>
              <div style="background: rgba(0,0,0,0.4); padding: 0.6rem 0.9rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="font-weight: 700; color: #2ecc71;">🧪 Poção de Cura Básica</p>
                  <p style="font-size: 0.78rem; color: #aaa;">Restaura 40 Pontos de Vida</p>
                </div>
                <span style="font-weight: 800; font-size: 1.1rem; color: #2ecc71;" id="modal-potion-qty">x${this.potionsCount}</span>
              </div>
              <div style="background: rgba(0,0,0,0.4); padding: 0.6rem 0.9rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="font-weight: 700; color: #f1c40f;">🪙 Moedas de Ouro</p>
                  <p style="font-size: 0.78rem; color: #aaa;">Cunhadas pelo reino de Brentel</p>
                </div>
                <span style="font-weight: 800; font-size: 1.1rem; color: #f1c40f;" id="modal-gold-qty">${this.gold}g</span>
              </div>
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.5); padding: 0.8rem 1.1rem; border-radius: 10px; border-left: 3px solid #e67e22;">
            <p style="font-weight: 700; color: #e67e22; font-size: 0.9rem;">Objetivo Ativo: O Resgate de Rebekka</p>
            <p style="font-size: 0.82rem; color: #ddd; margin-top: 0.2rem;">
              ${
                this.questCompleted
                  ? 'Você concluiu os preparativos com Dona Hilda. Treine na arena e parta em direção à Floresta Cinzenta.'
                  : 'Fale com Dona Hilda no balcão da Taverna Cauda do Dragão para recolher informações e mantimentos essenciais.'
              }
            </p>
          </div>
        </div>
      </div>
    `;

    // Eventos dos Hotspots e Botões
    document.getElementById('hotspot-hilda')?.addEventListener('click', () => this._startHildaDialogue());
    document.getElementById('hotspot-save')?.addEventListener('click', () => this._saveGame());
    document.getElementById('hotspot-arena')?.addEventListener('click', () => this._enterBattleArena());
    document.getElementById('hotspot-inventory')?.addEventListener('click', () => this._toggleInventory(true));

    document.getElementById('btn-open-bag')?.addEventListener('click', () => this._toggleInventory(true));
    document.getElementById('btn-save-game')?.addEventListener('click', () => this._saveGame());
    document.getElementById('btn-exit-tavern')?.addEventListener('click', () => this.stop());
    document.getElementById('btn-close-inventory')?.addEventListener('click', () => this._toggleInventory(false));
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      const inv = document.getElementById('inventory-modal');
      if (inv?.classList.contains('active')) {
        this._toggleInventory(false);
        return;
      }
      this.stop();
      return;
    }

    if (e.key === '1' || e.key.toLowerCase() === 'h') {
      this._startHildaDialogue();
      return;
    }

    if (e.key === '2' || e.key.toLowerCase() === 's') {
      this._saveGame();
      return;
    }

    if (e.key === '3' || e.key.toLowerCase() === 'a') {
      this._enterBattleArena();
      return;
    }

    if (e.key === '4' || e.key.toLowerCase() === 'i') {
      this._toggleInventory();
      return;
    }
  }

  private _updateHUD(): void {
    const goldEl = document.getElementById('hud-gold-text');
    const potionEl = document.getElementById('hud-potion-text');
    const questEl = document.getElementById('hud-quest-text');
    const modalGold = document.getElementById('modal-gold-qty');
    const modalPotion = document.getElementById('modal-potion-qty');

    if (goldEl) goldEl.textContent = `${this.gold}g`;
    if (potionEl) potionEl.textContent = `x${this.potionsCount} Poções`;
    if (questEl) {
      questEl.textContent = `Missão: ${this.questCompleted ? 'Pronto para a Floresta' : 'Falar com Dona Hilda'}`;
    }
    if (modalGold) modalGold.textContent = `${this.gold}g`;
    if (modalPotion) modalPotion.textContent = `x${this.potionsCount}`;
  }

  private _startHildaDialogue(): void {
    const lines: DialogueLine[] = [];

    if (!this.questCompleted) {
      lines.push(
        {
          speakerName: 'Dona Hilda',
          speakerRole: 'Proprietária da Cauda do Dragão',
          portraitUrl: '/assets/portraits/portrait_hilda.png',
          text: 'Rhogar, meu velho amigo! Que alívio vê-lo na Cauda do Dragão. O boato sobre o rapto de Rebekka não é exagero... As sombras se movem rápido.'
        },
        {
          speakerName: 'Rhogar Tordan',
          speakerRole: 'Guerreiro Draconato de Bronze',
          portraitUrl: '/assets/portraits/portrait_rhogar.png',
          text: 'Eu temia por isso. O que você conseguiu descobrir sobre o bando responsável, Hilda?'
        },
        {
          speakerName: 'Dona Hilda',
          speakerRole: 'Proprietária da Cauda do Dragão',
          portraitUrl: '/assets/portraits/portrait_hilda.png',
          text: 'Eles cruzaram a fronteira em direção à Floresta Cinzenta. Pegue estas 25 moedas de ouro e uma Poção de Cura para seus mantimentos. E lembre-se: a porta sul dá acesso à Arena de Treinamento se quiser aquecer o braço!'
        },
        {
          speakerName: 'Rhogar Tordan',
          speakerRole: 'Guerreiro Draconato de Bronze',
          portraitUrl: '/assets/portraits/portrait_rhogar.png',
          text: 'Obrigado pelo apoio de sempre, Hilda. Trarei Rebekka sã e salva, nem que tenha que derrubar todo o acampamento inimigo.'
        }
      );

      this.dialogueSystem.startDialogue(lines, () => {
        this.gold += 25;
        this.potionsCount += 1;
        this.questCompleted = true;
        this._updateHUD();
        this._saveGame();
      });
    } else {
      lines.push(
        {
          speakerName: 'Dona Hilda',
          speakerRole: 'Proprietária da Cauda do Dragão',
          portraitUrl: '/assets/portraits/portrait_hilda.png',
          text: 'Mantenha sua guarda alta, Rhogar. As noites em Brentel têm sido frias e cruéis. A arena de treino ao fundo continua aberta se desejar lutar.'
        },
        {
          speakerName: 'Rhogar Tordan',
          speakerRole: 'Guerreiro Draconato de Bronze',
          portraitUrl: '/assets/portraits/portrait_rhogar.png',
          text: 'Entendido. Estou pronto para a jornada.'
        }
      );

      this.dialogueSystem.startDialogue(lines);
    }
  }

  private _saveGame(): void {
    const payload: GameStatePayload = {
      playerData: {
        id: 'hero_rhogar',
        name: 'Rhogar Tordan',
        hp: 100,
        maxHp: 100,
        attack: 18,
        defense: 8,
        resource: 35,
        maxResource: 50,
        isPlayer: true
      },
      inventoryData: {
        gold: this.gold,
        items: [
          {
            id: 'test_item_heal',
            name: 'Poção de Cura Básica',
            type: 'consumable',
            value: 40,
            healHp: 40,
            description: 'Restaura 40 Pontos de Vida',
            quantity: this.potionsCount
          }
        ]
      },
      questsData: {
        test_quest_verification: {
          id: 'test_quest_verification',
          title: 'O Resgate de Rebekka',
          description: 'Investigue as redondezas de Brentel e resgate Rebekka.',
          status: this.questCompleted ? 'completed' : 'active'
        }
      }
    };

    globalSaveService.save(payload);

    // Efeito visual de Toast
    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.classList.add('active');
      setTimeout(() => {
        toast.classList.remove('active');
      }, 2400);
    }
  }

  private _enterBattleArena(): void {
    // Esconde Taverna temporariamente
    this.container.classList.remove('active');

    const arena = new GsapBattleArena();
    arena.start(() => {
      // Ao sair ou terminar o combate, reabre a Taverna
      this.container.classList.add('active');
      // Ganha ouro e experiência pela luta
      this.gold += 30;
      this._updateHUD();
      this._saveGame();
    });
  }

  private _toggleInventory(show?: boolean): void {
    const modal = document.getElementById('inventory-modal');
    if (!modal) return;

    const shouldShow = show !== undefined ? show : !modal.classList.contains('active');
    if (shouldShow) {
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
    }
  }
}
