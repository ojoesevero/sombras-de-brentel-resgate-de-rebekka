import gsap from 'gsap';

export interface DialogueLine {
  speakerName: string;
  speakerRole: string;
  portraitUrl: string;
  text: string;
}

export class DialogueSystem {
  private overlay: HTMLElement;
  private portraitEl: HTMLImageElement | null = null;
  private speakerNameEl: HTMLElement | null = null;
  private speakerRoleEl: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;
  private continuePromptEl: HTMLElement | null = null;

  private currentQueue: DialogueLine[] = [];
  private currentIndex: number = 0;
  private onCompleteCallback?: () => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(overlayId: string = 'dialogue-overlay') {
    let el = document.getElementById(overlayId);
    if (!el) {
      el = document.createElement('div');
      el.id = overlayId;
      el.className = 'dialogue-overlay';
      document.body.appendChild(el);
    }
    this.overlay = el;
    this.boundKeyDown = this._handleKeyDown.bind(this);
    this._renderBaseStructure();
  }

  private _renderBaseStructure(): void {
    this.overlay.innerHTML = `
      <div class="dialogue-stage">
        <div class="dialogue-portrait-wrap">
          <img class="dialogue-portrait" id="dialogue-portrait-img" src="" alt="Speaker" />
        </div>
        <div class="dialogue-box" id="dialogue-main-box">
          <div class="dialogue-speaker-tag">
            <span id="dialogue-speaker-name">Personagem</span>
            <span class="dialogue-speaker-role" id="dialogue-speaker-role">Título</span>
          </div>
          <p class="dialogue-text" id="dialogue-content-text">Texto de diálogo...</p>
          <div class="dialogue-footer">
            <span class="dialogue-continue-prompt" id="dialogue-continue-btn">[Z / Espaço] Continuar ▶</span>
          </div>
        </div>
      </div>
    `;

    this.portraitEl = this.overlay.querySelector('#dialogue-portrait-img') as HTMLImageElement;
    this.speakerNameEl = this.overlay.querySelector('#dialogue-speaker-name');
    this.speakerRoleEl = this.overlay.querySelector('#dialogue-speaker-role');
    this.textEl = this.overlay.querySelector('#dialogue-content-text');
    this.continuePromptEl = this.overlay.querySelector('#dialogue-continue-btn');

    this.continuePromptEl?.addEventListener('click', () => this.advance());
    this.overlay.querySelector('#dialogue-main-box')?.addEventListener('click', () => this.advance());
  }

  public startDialogue(lines: DialogueLine[], onComplete?: () => void): void {
    if (lines.length === 0) return;

    this.currentQueue = lines;
    this.currentIndex = 0;
    this.onCompleteCallback = onComplete;
    this.overlay.classList.add('active');

    window.addEventListener('keydown', this.boundKeyDown);

    // Entrada cinematográfica da janela com GSAP
    gsap.fromTo(
      this.overlay.querySelector('.dialogue-box'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
    );

    this._showLine(this.currentIndex);
  }

  private _showLine(index: number): void {
    const line = this.currentQueue[index];
    if (!line) return;

    if (this.speakerNameEl) this.speakerNameEl.textContent = line.speakerName;
    if (this.speakerRoleEl) this.speakerRoleEl.textContent = line.speakerRole ? `• ${line.speakerRole}` : '';

    if (this.portraitEl) {
      this.portraitEl.src = line.portraitUrl;
      // Animação de entrada do portrait
      gsap.fromTo(
        this.portraitEl,
        { scale: 0.94, opacity: 0.7, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' }
      );
    }

    if (this.textEl) {
      this.textEl.textContent = line.text;
      gsap.fromTo(
        this.textEl,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }
      );
    }
  }

  public advance(): void {
    this.currentIndex++;
    if (this.currentIndex < this.currentQueue.length) {
      this._showLine(this.currentIndex);
    } else {
      this.close();
    }
  }

  public close(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    gsap.to(this.overlay.querySelector('.dialogue-box'), {
      y: 30,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        this.overlay.classList.remove('active');
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
      }
    });
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'z') {
      e.preventDefault();
      this.advance();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }
}
