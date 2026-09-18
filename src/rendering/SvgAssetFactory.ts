/**
 * [PROCEDURAL VECTOR GRAPHICS - NO JPG / NO PNG]
 * Fábrica de Sprites e Elementos de Cenário em SVG e CSS Puro.
 * Gera elementos gráficos em tempo de execução com vetores nítidos e escaláveis.
 */
export class SvgAssetFactory {
  /**
   * Rhogar Tordan: Guerreiro Draconato com chifres, armadura escurecida, capa rubra e maça de guerra.
   */
  public static createRhogarSvg(): string {
    return `
      <svg class="character-svg rhogar-svg" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="draconic-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#ff4422" flood-opacity="0.6"/>
          </filter>
          <linearGradient id="scales-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#a33826"/>
            <stop offset="60%" stop-color="#6e1f14"/>
            <stop offset="100%" stop-color="#3d0e08"/>
          </linearGradient>
          <linearGradient id="armor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4a525d"/>
            <stop offset="50%" stop-color="#2a3038"/>
            <stop offset="100%" stop-color="#181c22"/>
          </linearGradient>
          <linearGradient id="cape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b82525"/>
            <stop offset="100%" stop-color="#540e0e"/>
          </linearGradient>
        </defs>

        <!-- Sombra Projetada no Chão -->
        <ellipse class="char-shadow" cx="24" cy="52" rx="14" ry="4" fill="rgba(0,0,0,0.55)"/>

        <!-- Capa Oscilante -->
        <path class="char-cape" d="M16 22 Q12 40 10 50 Q24 53 38 50 Q36 40 32 22 Z" fill="url(#cape-grad)"/>

        <!-- Pernas e Botas de Placas -->
        <g class="char-legs">
          <!-- Perna Esquerda -->
          <rect class="leg leg-left" x="16" y="38" width="6" height="13" rx="2" fill="url(#armor-grad)" stroke="#111" stroke-width="1"/>
          <!-- Perna Direita -->
          <rect class="leg leg-right" x="26" y="38" width="6" height="13" rx="2" fill="url(#armor-grad)" stroke="#111" stroke-width="1"/>
        </g>

        <!-- Tronco / Peitoral com Escamas Draconianas -->
        <path d="M15 20 L33 20 L31 39 L17 39 Z" fill="url(#armor-grad)" stroke="#111" stroke-width="1.2"/>
        <path d="M19 23 L29 23 L28 35 L20 35 Z" fill="url(#scales-grad)"/>

        <!-- Braço Esquerdo & Maça de Batalha -->
        <g class="char-arm-left">
          <rect x="9" y="21" width="5" height="15" rx="2" fill="url(#armor-grad)" stroke="#111" stroke-width="0.8"/>
          <!-- Cabo da Maça -->
          <rect x="8" y="12" width="3" height="30" rx="1" fill="#8c6239"/>
          <!-- Cabeça da Maça com Espinhos -->
          <circle cx="9.5" cy="12" r="6" fill="#707984" stroke="#ff8800" stroke-width="1.2" filter="url(#draconic-glow)"/>
          <polygon points="9.5,4 7,8 12,8" fill="#d97706"/>
          <polygon points="17.5,12 13.5,9.5 13.5,14.5" fill="#d97706"/>
          <polygon points="1.5,12 5.5,9.5 5.5,14.5" fill="#d97706"/>
        </g>

        <!-- Braço Direito -->
        <rect x="34" y="21" width="5" height="15" rx="2" fill="url(#armor-grad)" stroke="#111" stroke-width="0.8"/>

        <!-- Cabeça Draconiana -->
        <g class="char-head">
          <polygon points="17,10 24,18 31,10 33,5 24,9 15,5" fill="url(#scales-grad)" stroke="#111" stroke-width="1"/>
          <!-- Focinho -->
          <path d="M19 13 Q24 21 29 13 Z" fill="#6e1f14"/>
          <!-- Olhos Draconianos Brilhantes -->
          <polygon points="20,11 22,12 20,13" fill="#ffea00" filter="url(#draconic-glow)"/>
          <polygon points="28,11 26,12 28,13" fill="#ffea00" filter="url(#draconic-glow)"/>
          <!-- Chifres -->
          <path d="M17 9 Q10 2 12 -2 Q18 3 19 8" fill="#1c1f24" stroke="#d97706" stroke-width="0.8"/>
          <path d="M31 9 Q38 2 36 -2 Q30 3 29 8" fill="#1c1f24" stroke="#d97706" stroke-width="0.8"/>
        </g>
      </svg>
    `;
  }

  /**
   * Joseph Sylven: Paladino em armadura dourada-prateada com escudo e espada sagrada.
   */
  public static createJosephSvg(): string {
    return `
      <svg class="character-svg joseph-svg" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="holy-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ffd700" flood-opacity="0.7"/>
          </filter>
          <linearGradient id="paladin-armor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="40%" stop-color="#cfd8dc"/>
            <stop offset="100%" stop-color="#78909c"/>
          </linearGradient>
          <linearGradient id="gold-trim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ffe082"/>
            <stop offset="50%" stop-color="#ffd54f"/>
            <stop offset="100%" stop-color="#ffb300"/>
          </linearGradient>
        </defs>

        <ellipse class="char-shadow" cx="24" cy="52" rx="13" ry="3.5" fill="rgba(0,0,0,0.5)"/>

        <!-- Capa Branca/Dourada -->
        <path class="char-cape" d="M16 22 Q13 38 12 48 Q24 51 36 48 Q35 38 32 22 Z" fill="#eceff1" stroke="#ffd54f" stroke-width="1"/>

        <!-- Pernas -->
        <rect class="leg leg-left" x="17" y="38" width="5.5" height="13" rx="2" fill="url(#paladin-armor)" stroke="#37474f" stroke-width="0.8"/>
        <rect class="leg leg-right" x="25.5" y="38" width="5.5" height="13" rx="2" fill="url(#paladin-armor)" stroke="#37474f" stroke-width="0.8"/>

        <!-- Torso com Brasão Sagrado -->
        <path d="M16 20 L32 20 L30 38 L18 38 Z" fill="url(#paladin-armor)" stroke="#37474f" stroke-width="1"/>
        <!-- Cruz Dourada no Peito -->
        <path d="M23 23 H25 V33 H23 Z M20 26 H28 V28 H20 Z" fill="url(#gold-trim)" filter="url(#holy-glow)"/>

        <!-- Braço e Escudo da Fé -->
        <g class="char-shield">
          <path d="M6 22 Q12 18 16 22 L16 35 Q11 42 6 36 Z" fill="url(#paladin-armor)" stroke="#ffd54f" stroke-width="1.2" filter="url(#holy-glow)"/>
          <circle cx="11" cy="28" r="3" fill="url(#gold-trim)"/>
        </g>

        <!-- Braço e Espada Radiante -->
        <g class="char-sword">
          <rect x="33" y="21" width="5" height="13" rx="2" fill="url(#paladin-armor)"/>
          <line x1="36" y1="12" x2="36" y2="40" stroke="#ffd54f" stroke-width="2.5" stroke-linecap="round" filter="url(#holy-glow)"/>
          <line x1="33" y1="32" x2="39" y2="32" stroke="#b0bec5" stroke-width="2"/>
        </g>

        <!-- Cabeça / Elmo com Visor -->
        <g class="char-head">
          <rect x="18" y="9" width="12" height="12" rx="4" fill="url(#paladin-armor)" stroke="#ffd54f" stroke-width="1"/>
          <!-- Fenda dos Olhos -->
          <rect x="20" y="14" width="8" height="2" rx="1" fill="#1a237e" filter="url(#holy-glow)"/>
          <!-- Pluma Dourada -->
          <path d="M24 8 Q27 2 24 -1 Q21 2 24 8" fill="url(#gold-trim)"/>
        </g>
      </svg>
    `;
  }

  /**
   * Lobo Cinzento / Lobo das Sombras: Silhueta lupina intimidadora com olhos vermelhos brilhantes.
   */
  public static createWolfSvg(): string {
    return `
      <svg class="creature-svg wolf-svg" viewBox="0 0 52 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="wolf-red-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#ff1744" flood-opacity="0.8"/>
          </filter>
          <linearGradient id="fur-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#455a64"/>
            <stop offset="60%" stop-color="#263238"/>
            <stop offset="100%" stop-color="#10171a"/>
          </linearGradient>
        </defs>

        <ellipse class="char-shadow" cx="26" cy="36" rx="18" ry="4" fill="rgba(0,0,0,0.55)"/>

        <!-- Cauda Peluda -->
        <path class="wolf-tail" d="M42 22 Q48 18 47 10 Q43 16 38 20 Z" fill="url(#fur-grad)"/>

        <!-- Patas Traseiras -->
        <rect class="leg leg-back-left" x="33" y="24" width="5" height="13" rx="2" fill="#1b2327"/>
        <rect class="leg leg-back-right" x="38" y="24" width="5" height="13" rx="2" fill="#263238"/>

        <!-- Tronco Musculoso -->
        <path d="M16 16 Q28 12 39 19 Q37 28 20 28 Q14 24 16 16 Z" fill="url(#fur-grad)"/>

        <!-- Patas Dianteiras -->
        <rect class="leg leg-front-left" x="15" y="22" width="5" height="15" rx="2" fill="#1b2327"/>
        <rect class="leg leg-front-right" x="20" y="22" width="5" height="15" rx="2" fill="#263238"/>

        <!-- Cabeça e Focinho Agressivo -->
        <g class="wolf-head">
          <polygon points="16,16 6,19 12,12 18,10" fill="url(#fur-grad)"/>
          <!-- Orelhas Pontiagudas -->
          <polygon points="14,10 13,3 17,7" fill="#10171a"/>
          <polygon points="18,10 20,4 21,9" fill="#1b2327"/>
          <!-- Olhos Carmesim Brilhantes -->
          <ellipse cx="12" cy="14" rx="2" ry="1.2" fill="#ff1744" filter="url(#wolf-red-glow)"/>
          <!-- Dentes Afiados -->
          <polygon points="8,19 7,22 10,20" fill="#ffffff"/>
        </g>
      </svg>
    `;
  }

  /**
   * Bandido da Estrada: Manto escuro, adagas e máscara facial.
   */
  public static createBanditSvg(): string {
    return `
      <svg class="creature-svg bandit-svg" viewBox="0 0 44 54" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="dagger-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#00e5ff" flood-opacity="0.7"/>
          </filter>
        </defs>

        <ellipse class="char-shadow" cx="22" cy="50" rx="12" ry="3.5" fill="rgba(0,0,0,0.5)"/>

        <!-- Capuz e Manto Escuro -->
        <path d="M14 20 L30 20 L32 44 L12 44 Z" fill="#212121" stroke="#111" stroke-width="1"/>

        <!-- Pernas -->
        <rect class="leg leg-left" x="15" y="42" width="5" height="10" rx="1.5" fill="#181818"/>
        <rect class="leg leg-right" x="24" y="42" width="5" height="10" rx="1.5" fill="#181818"/>

        <!-- Adagas Rápidas -->
        <g class="bandit-daggers">
          <line x1="8" y1="26" x2="3" y2="38" stroke="#00e5ff" stroke-width="2" filter="url(#dagger-glow)"/>
          <line x1="36" y1="26" x2="41" y2="38" stroke="#00e5ff" stroke-width="2" filter="url(#dagger-glow)"/>
        </g>

        <!-- Cabeça com Máscara e Olhos Furtivos -->
        <g class="bandit-head">
          <path d="M14 16 Q22 8 30 16 L28 22 L16 22 Z" fill="#2d3748"/>
          <!-- Olhos Frios -->
          <circle cx="19" cy="17" r="1.5" fill="#f87171"/>
          <circle cx="25" cy="17" r="1.5" fill="#f87171"/>
        </g>
      </svg>
    `;
  }

  /**
   * Árvore Anciã da Floresta Cinzenta com galhos volumosos em SVG.
   */
  public static createAncientTreeSvg(heightPx: number = 260): string {
    return `
      <svg class="scenery-tree" viewBox="0 0 160 260" height="${heightPx}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="trunk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2d2218"/>
            <stop offset="35%" stop-color="#4a3726"/>
            <stop offset="70%" stop-color="#3b2b1e"/>
            <stop offset="100%" stop-color="#1f160f"/>
          </linearGradient>
          <linearGradient id="foliage-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2a4736"/>
            <stop offset="60%" stop-color="#1c3125"/>
            <stop offset="100%" stop-color="#0e1b14"/>
          </linearGradient>
          <linearGradient id="foliage-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3b5e48"/>
            <stop offset="70%" stop-color="#223a2c"/>
            <stop offset="100%" stop-color="#122018"/>
          </linearGradient>
        </defs>

        <!-- Sombra da Árvore -->
        <ellipse cx="80" cy="250" rx="65" ry="12" fill="rgba(0,0,0,0.6)"/>

        <!-- Raízes Espessas Retorcidas -->
        <path d="M45 252 Q60 240 70 200 Q90 200 100 240 Q115 252 125 254 Q105 248 95 220 Q65 220 55 248 Z" fill="url(#trunk-grad)"/>

        <!-- Tronco Forte com Textura de Casca -->
        <path d="M70 210 Q65 140 50 90 Q80 120 110 90 Q95 140 90 210 Z" fill="url(#trunk-grad)"/>

        <!-- Camadas de Copa / Folhagem com Profundidade -->
        <g class="tree-canopy">
          <!-- Copa Traseira -->
          <circle cx="80" cy="70" r="62" fill="url(#foliage-grad-1)"/>
          <circle cx="45" cy="85" r="42" fill="url(#foliage-grad-1)"/>
          <circle cx="115" cy="85" r="42" fill="url(#foliage-grad-1)"/>

          <!-- Copa Frontal Iluminada -->
          <circle cx="75" cy="55" r="48" fill="url(#foliage-grad-2)"/>
          <circle cx="40" cy="70" r="35" fill="url(#foliage-grad-2)"/>
          <circle cx="112" cy="70" r="36" fill="url(#foliage-grad-2)"/>
          <circle cx="80" cy="35" r="30" fill="url(#foliage-grad-2)"/>
        </g>
      </svg>
    `;
  }

  /**
   * Tocha de Trilha com Fogo Animado e Brilho Radiante.
   */
  public static createTorchSvg(): string {
    return `
      <svg class="scenery-torch" viewBox="0 0 24 48" width="24" height="48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="torch-fire-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="-2" stdDeviation="4" flood-color="#ff7700" flood-opacity="0.9"/>
          </filter>
        </defs>
        <!-- Poste de Madeira -->
        <rect x="10" y="16" width="4" height="32" rx="1.5" fill="#4a3726" stroke="#2a1f16" stroke-width="0.8"/>
        <!-- Suporte Metálico -->
        <polygon points="8,16 16,16 14,21 10,21" fill="#78909c"/>
        <!-- Chama Animada -->
        <path class="torch-flame" d="M12 2 Q17 8 15 15 Q12 17 9 15 Q7 8 12 2 Z" fill="#ffea00" filter="url(#torch-fire-glow)"/>
        <path class="torch-flame-core" d="M12 7 Q14 10 13 15 Q12 16 11 15 Q10 10 12 7 Z" fill="#ffffff"/>
      </svg>
    `;
  }
}
