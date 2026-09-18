<div align="center">

# ⚔️ Sombras de Brentel — Resgate de Rebekka

<p align="center">
  <strong>Fundação Técnica para JRPG 2D Clássico em Pixel Art</strong><br>
  <em>Exploração Top-Down, Combate Tático por Turnos e Arquitetura Desacoplada com TypeScript Estrito</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Versão-0.2.0--fundação-6366f1?style=for-the-badge" alt="Versão 0.2.0">
  <img src="https://img.shields.io/badge/Phaser-3.88.2-e0234e?style=for-the-badge&logo=phaser&logoColor=white" alt="Phaser 3">
  <img src="https://img.shields.io/badge/TypeScript-Estrito_5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Strict">
  <img src="https://img.shields.io/badge/Vite-6.2.0-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Testes-25_Passando-10b981?style=for-the-badge&logo=node.js&logoColor=white" alt="25 Testes Passando">
  <img src="https://img.shields.io/badge/Resolução-480x270_(16:9)-f59e0b?style=for-the-badge" alt="480x270">
</p>

---

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-estado-atual-da-fundação">Estado Atual</a> •
  <a href="#-arquitetura-do-código">Arquitetura</a> •
  <a href="#-pixel-art-e-resolução">Pixel Art</a> •
  <a href="#-controles">Controles</a> •
  <a href="#-executando-o-projeto">Instalação</a> •
  <a href="#-testes-e-validação">Testes</a> •
  <a href="#-próximas-etapas">Roadmap</a>
</p>

</div>

<br>

---

## 📖 Sobre o Projeto

**Sombras de Brentel — Resgate de Rebekka** é uma fundação técnica de alta fidelidade para o desenvolvimento de um jogo no estilo **JRPG 2D clássico** em pixel art. O projeto servirá como base para uma demo narrativa ambientada no universo literário de *Sombras de Brentel*, tendo como protagonista controlável **Rhogar Tordan** (guerreiro draconato meio-sangue) em sua jornada de resgate a Rebekka.

> ℹ️ **Fase Atual:** O repositório está na fase de **validação e calibração dos sistemas fundamentais**. A narrativa definitiva, cenários finais e artes autorais do livro serão integrados progressivamente sobre esta base técnica sólida.

---

## 🎯 Estado Atual da Fundação (v0.2.0)

Esta versão provê um ambiente técnico neutro e executável, validando:

<table>
  <thead>
    <tr>
      <th width="30%">Módulo / Sistema</th>
      <th width="70%">Descrição da Implementação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>🕹️ Exploração Top-Down</strong></td>
      <td>Movimentação fluida em 8 direções com normalização vetorial e colisão estática de cenário (obstáculos e limites).</td>
    </tr>
    <tr>
      <td><strong>⚔️ Combate por Turnos</strong></td>
      <td>Arena de combate tático via máquina de estados finita (FSM): fluxo de turnos, ataque básico, habilidade técnica (<em>Technical Skill</em>), cálculo de mitigação de dano por defesa, condições de vitória, derrota e retorno à exploração.</td>
    </tr>
    <tr>
      <td><strong>💬 Interação e Diálogos</strong></td>
      <td>Detecção de proximidade com NPCs, exibição de balão/caixa de diálogo procedural responsiva acionada por teclado.</td>
    </tr>
    <tr>
      <td><strong>📐 Escala Pixel-Perfect</strong></td>
      <td>Algoritmo de <em>Integer Scaling</em> matemático preservando pixels nítidos sem distorção ou <em>sub-pixel shimmer</em>.</td>
    </tr>
    <tr>
      <td><strong>⌨️ Controles Unificados</strong></td>
      <td>Gerenciador centralizado de teclado com suporte a teclas primárias (Setas, <kbd>Z</kbd>, <kbd>X</kbd>) e secundárias (<kbd>WASD</kbd>, <kbd>Enter</kbd>, <kbd>Espaço</kbd>, <kbd>Esc</kbd>).</td>
    </tr>
    <tr>
      <td><strong>🧪 Regras de Domínio Puras</strong></td>
      <td>Regras de combate, inventário e missões totalmente isoladas do Phaser e do DOM, com <strong>100% de cobertura por testes automatizados</strong>.</td>
    </tr>
    <tr>
      <td><strong>💾 Persistência & Savegame</strong></td>
      <td>Persistência desacoplada em Base64 com suporte UTF-8 via Runa de Salvamento no mapa e opção dinâmica de continuar no menu principal.</td>
    </tr>
    <tr>
      <td><strong>🎒 Inventário & Missões</strong></td>
      <td>Gestão de ouro, poções com consumo e débito real em combate e progressão de objetivos integrada ao HUD.</td>
    </tr>
  </tbody>
</table>

---

## 🏗️ Arquitetura do Código

A base segue uma arquitetura em **4 camadas desacopladas** com tipagem estrita (`strict: true`, sem `any` ou `@ts-ignore`):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CAMADA DE DOMÍNIO (Pure TypeScript - 100% Coberta por Testes)            │
│    • Combatant.ts      : Atributos, HP, mitigação de dano, recurso e ataques│
│    • TurnEngine.ts     : FSM de combate em turnos, fila de ações e vitória  │
│    • InventoryModel.ts : Gestão de itens, ouro, consumo e estoque           │
│    • QuestGraph.ts     : Grafo de status de missões (locked/active/done)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CAMADA DE SERVIÇOS & APLICAÇÃO                                           │
│    • InputService.ts : Mapeamento unificado de teclado e eventos            │
│    • EventBus.ts     : Barramento desacoplado com generics estritos         │
│    • AudioService.ts : Efeitos sonoros sintéticos via Web Audio             │
│    • SaveService.ts  : Persistência Base64 com suporte UTF-8/LocalStorage   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. CAMADA DE APRESENTAÇÃO (Phaser 3)                                        │
│    • BaseScene.ts              : Configuração padrão de câmera (roundPixels)│
│    • BootScene / PreloadScene  : Ciclo de vida, JSONs e texturas procedurais│
│    • MainMenuScene.ts          : Menu retro com detecção dinâmica de Save   │
│    • TechnicalSandboxScene.ts  : Sandbox top-down, HUD, Runa de Salvar e NPC│
│    • BattlePrototypeScene.ts   : Arena de batalha com consumo de inventário │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. DADOS DATA-DRIVEN (public/data/)                                         │
│    • items.json • enemies.json • dialogues.json • quests.json • maps.json   │
└─────────────────────────────────────────────────────────────────────────────┘
```

> 🌟 **Sistemas Conectados ao Gameplay:** Os módulos `InventoryModel`, `QuestGraph` e `SaveService` estão totalmente integrados ao loop de exploração e batalha, permitindo salvar progresso, consumir poções e avançar missões.

---

## 🎨 Pixel Art e Sistema de Escala

Para garantir fidelidade visual matemática aos clássicos em pixel art:

- **Resolução Lógica:** `480x270` pixels (proporção nativa 16:9).
- **Integer Scaling:** Em resoluções $\ge 480\times 270$, o canvas utiliza o maior multiplicador inteiro ($1\times, 2\times, 3\times, 4\times, \dots$) com *letterboxing* ou *pillarboxing* centralizado.
- **Telas Pequenas:** Fallback de redução proporcional mantendo rigorosamente a proporção 16:9 sem cortes de viewport.
- **Arredondamento de Câmera:** `this.cameras.main.setRoundPixels(true)` configurado em todas as cenas via `BaseScene`.
- **Renderização CSS:** Propriedades `image-rendering: pixelated; crisp-edges;` ativadas globalmente.

---

## 🎮 Controles

O esquema de controles é centralizado e suporta layouts clássicos de JRPG de teclado:

<table>
  <thead>
    <tr>
      <th width="35%">Ação</th>
      <th width="35%">Teclas Primárias</th>
      <th width="30%">Teclas Secundárias</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Mover / Navegar</strong></td>
      <td><kbd>▲</kbd> <kbd>▼</kbd> <kbd>◄</kbd> <kbd>►</kbd> (Setas)</td>
      <td><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></td>
    </tr>
    <tr>
      <td><strong>Confirmar / Interagir</strong></td>
      <td><kbd>Z</kbd></td>
      <td><kbd>Enter</kbd> / <kbd>Espaço</kbd></td>
    </tr>
    <tr>
      <td><strong>Cancelar / Voltar / Menu</strong></td>
      <td><kbd>X</kbd></td>
      <td><kbd>Esc</kbd></td>
    </tr>
    <tr>
      <td><strong>Atalho: Sandbox de Exploração</strong></td>
      <td><kbd>1</kbd></td>
      <td>—</td>
    </tr>
    <tr>
      <td><strong>Atalho: Protótipo de Combate</strong></td>
      <td><kbd>2</kbd></td>
      <td>—</td>
    </tr>
  </tbody>
</table>

---

## 📁 Estrutura de Diretórios

```
sombras-de-brentel-resgate-de-rebekka/
├── docs/                      # Documentação de arquitetura e auditoria técnica
│   └── ARCHITECTURE.md
├── public/                    # Assets estáticos e base de dados data-driven
│   └── data/                  # JSONs de calibração (itens, inimigos, diálogos, etc.)
├── src/
│   ├── config/                # Parâmetros da engine e algoritmo de pixelScale
│   ├── core/                  # Regras puras de domínio (FSM de turnos, combate, inventário)
│   ├── scenes/                # Cenas do Phaser (Menu, Sandbox, Batalha, Boot, Preload)
│   ├── services/              # Serviços de entrada (Input), eventos e áudio
│   ├── types/                 # Definições de tipos e interfaces TypeScript estritas
│   └── main.ts                # Ponto de entrada e instanciação da aplicação Phaser
├── tests/                     # 25 testes unitários cobrindo todo o domínio
├── index.html                 # Shell HTML5 com container de renderização pixel art
├── package.json               # Manifest de dependências e scripts NPM
├── tsconfig.json              # Configuração TypeScript em modo estrito
└── vite.config.js             # Configuração do Vite Dev Server e Build
```

---

## 🚀 Executando o Projeto

### Pré-requisitos
- **Node.js:** Versão `20.0.0` ou superior.
- **npm:** Gerenciador de pacotes do Node.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/ojoesevero/sombras-de-brentel-resgate-de-rebekka.git
   cd sombras-de-brentel-resgate-de-rebekka
   ```

2. **Instale as dependências:**
   ```bash
   npm ci
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. Abra no navegador: **`http://localhost:3000`**

---

## 🛠️ Scripts Disponíveis

<table>
  <thead>
    <tr>
      <th width="30%">Script</th>
      <th width="70%">Descrição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>npm run dev</code></td>
      <td>Inicia o servidor de desenvolvimento Vite com HMR na porta <code>3000</code>.</td>
    </tr>
    <tr>
      <td><code>npm test</code></td>
      <td>Executa as 5 suítes de testes unitários automatizados via <code>node --test</code> e <code>tsx</code>.</td>
    </tr>
    <tr>
      <td><code>npm run typecheck</code></td>
      <td>Executa a verificação estática de tipos do TypeScript (<code>tsc --noEmit</code>).</td>
    </tr>
    <tr>
      <td><code>npm run build</code></td>
      <td>Valida a tipagem e compila os arquivos de produção para o diretório <code>dist/</code>.</td>
    </tr>
    <tr>
      <td><code>npm run preview</code></td>
      <td>Inicia um servidor local para inspecionar o build de produção gerado em <code>dist/</code>.</td>
    </tr>
  </tbody>
</table>

---

## 🧪 Testes e Validação

O projeto conta com **25 testes unitários determinísticos** distribuídos em 5 suítes:

<details open>
<summary><strong>📋 Detalhamento das Suítes de Teste</strong></summary>
<br>

1. **`tests/Combatant.test.ts` (7 testes):** Atributos de combatente, cálculo de mitigação de dano, ganho de recurso (SP/TP), habilidades técnicas e cura.
2. **`tests/TurnEngine.test.ts` (6 testes):** FSM de turnos, transição jogador $\rightarrow$ inimigos, execução de habilidades, condições de vitória e derrota.
3. **`tests/InventoryModel.test.ts` (5 testes):** Saldo de ouro, adição/remoção de itens de teste, uso de consumíveis em combate e serialização.
4. **`tests/QuestGraph.test.ts` (4 testes):** Ciclo de vida de missões (*locked*, *active*, *completed*), avanço de etapas e restauração de estado.
5. **`tests/SaveService.test.ts` (3 testes):** Codificação Base64 com suporte integral a UTF-8/acentuação, persistência e limpeza.

</details>

Para rodar todo o pipeline de validação técnica:
```bash
npm test && npm run typecheck && npm run build
```

---

## 📜 Diretrizes Narrativas & Cânone

- 📚 **Fonte Soberana:** O livro *Sombras de Brentel* é a referência absoluta para acontecimentos, personalidades e relações entre personagens.
- ⚙️ **Valores de Calibração:** Atributos e nomes técnicos atuais são provisórios para aferição da engine e não representam o balanceamento final.
- 🛡️ **Fidelidade Temática:** O clima medieval de baixa fantasia e as características de combate de Rhogar serão respeitados na elaboração dos cenários e diálogos.

---

## 🗺️ Próximas Etapas (Roadmap)

- [x] Conexão dos módulos de Inventário, Grafo de Missões e Persistência (Savegame) ao fluxo jogável.
- [ ] Validação de gameplay da exploração e combate em múltiplos dispositivos/resoluções.
- [ ] Documentação do roteiro canônico da chegada de Rhogar à Taverna.
- [ ] Construção do mapa final da Taverna de Rastphen em Tilemap.
- [ ] Implementação da cena de flashback da **Arena de Centúrion** como tutorial de combate.
- [ ] Desenvolvimento da expedição e narrativa do Resgate de Rebekka.

---

<div align="center">

### ⚖️ Licença e Direitos Autorais

Todos os direitos sobre o código-fonte, universo ficcional, personagens, narrativa e elementos visuais são reservados aos seus respectivos titulares.<br>
*Nenhuma licença de redistribuição ou uso comercial desautorizado é concedida por este repositório.*

</div>