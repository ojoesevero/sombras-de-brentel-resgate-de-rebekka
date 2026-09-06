# Arquitetura Técnica: Sombras de Brentel

**Versão da Fundação:** 0.2.0 (Fundação Técnica em TypeScript Estrito)  
**Stack Principal:** Phaser 3 (`^3.88.2`), TypeScript (`^5.8.2`), Vite (`^6.2.0`), tsx (`^4.19.3`), Node.js Test Runner.  
**Proposta:** Fundação técnica mínima, executável e testável para um JRPG 2D em pixel art com visão superior (*top-down*) e combate tático por turnos.

---

## 1. Visão Geral da Arquitetura em TypeScript

A fundação adota uma arquitetura em 4 camadas desacopladas com contratos estritos em TypeScript (`src/types/game.types.ts`), sem dependência de `any`, `@ts-ignore` ou `@ts-nocheck`:

```
+-------------------------------------------------------------------------+
|                  CAMADA 1: CORE DOMAIN (Regras Puras)                   |
|  - Combatant.ts (Combatente: HP, TestResource, mitigação, ataques)      |
|  - TurnEngine.ts (FSM de turnos: fila, ações, alvos, vitória e derrota) |
|  [Infraestrutura Experimental Desconectada]:                            |
|  - InventoryModel.ts (Modelo de itens, estoque e ouro - desacoplado)    |
|  - QuestGraph.ts (Grafo de missões: locked/active/completed)            |
|  * 100% isolada de Phaser/DOM - Testada via tsx + node:test             |
+-------------------------------------------------------------------------+
                                     |
+-------------------------------------------------------------------------+
|                  CAMADA 2: APPLICATION & SERVICES                       |
|  - InputService.ts (Mapeamento de teclado e ciclo de vida de listeners) |
|  - EventBus.ts (Barramento desacoplado tipado com generics estritos)    |
|  [Infraestrutura Experimental Desconectada]:                            |
|  - SaveService.ts (Persistência multi-driver: LocalStorage + In-Memory) |
+-------------------------------------------------------------------------+
                                     |
+-------------------------------------------------------------------------+
|                  CAMADA 3: APRESENTAÇÃO (Phaser 3 Engine)               |
|  - BaseScene.ts (Cena base abstrata configurando roundPixels na câmera) |
|  - BootScene.ts (Inicialização de renderização e delegador de boot)     |
|  - PreloadScene.ts (Carregamento de JSONs e geração de pixel art)       |
|  - MainMenuScene.ts (Menu principal retro navegável 100% por teclado)   |
|  - TechnicalSandboxScene.ts (Visão top-down, colisão, diálogo de teste) |
|  - BattlePrototypeScene.ts (Arena de turnos, seleção de alvos e FSM)   |
+-------------------------------------------------------------------------+
                                     |
+-------------------------------------------------------------------------+
|                  CAMADA 4: DADOS DESACOPLADOS (Data-Driven)             |
|  - public/data/items.json (Catálogo de itens de calibração técnica)     |
|  - public/data/enemies.json (Estatísticas de alvos de treinamento)      |
|  - public/data/dialogues.json (Estruturas neutras de diálogo)           |
|  - public/data/quests.json (Estrutura neutra de missões técnicas)       |
|  - public/data/maps.json (Limites e portais de transição de teste)      |
+-------------------------------------------------------------------------+
```

---

## 2. Sistema de Escala e Pixel Art Estrito

Para assegurar fidelidade matemática aos clássicos em pixel art e eliminar distorções de sub-pixel:

- **Resolução Lógica Fixa:** `480x270` pixels (proporção 16:9).
- **Algoritmo de Escala Inteira (`src/config/pixelScale.ts`):**
  - Em viewports $\ge 480\times 270$: calcula o maior multiplicador inteiro ($1\times, 2\times, 3\times, 4\times, \dots$), aplicando *letterboxing* ou *pillarboxing* centralizado.
  - Em viewports $< 480\times 270$: fallback de redução proporcional mantendo a proporção 16:9 rigorosamente sem overflow (documentado que redução proporcional não constitui integer upscaling).
- **Arredondamento de Câmera (`src/scenes/BaseScene.ts`):**
  - Toda cena herda de `BaseScene` e invoca `this.cameras.main.setRoundPixels(true)`.
- **Configurações Globais do Phaser (`src/config/gameConfig.ts`):**
  - `pixelArt: true`
  - `antialias: false`
  - `roundPixels: true`
- **Renderização CSS (`index.html`):**
  - `image-rendering: pixelated;`
  - `image-rendering: crisp-edges;`

---

## 3. Fluxo de Cenas e Desconexão de Sistemas Excedentes

```mermaid
graph TD
    Boot[1. BootScene] --> Preload[2. PreloadScene]
    Preload --> Menu[3. MainMenuScene]
    
    Menu -->|Tecla 1 ou Confirmar| Sandbox[4. TechnicalSandboxScene (Top-Down Sandbox)]
    Menu -->|Tecla 2 ou Confirmar| Battle[5. BattlePrototypeScene (Turn Arena)]
    
    Sandbox -->|Portal de Combate| Battle
    Battle -->|Vitória / Derrota / Fuga| Sandbox
    
    Sandbox -.->|Tecla ESC / Cancelar| Menu
    Battle -.->|Tecla ESC / Cancelar| Sandbox
```

### Status dos Módulos:
1. **Fluxo Executável Ativo:** `BootScene`, `PreloadScene`, `MainMenuScene`, `TechnicalSandboxScene`, `BattlePrototypeScene`, `Combatant`, `TurnEngine`, `InputService`, `EventBus`, `pixelScale`.
2. **Infraestrutura Experimental Desconectada:**
   - `InventoryModel`: Não é instanciado pelas cenas ativas; permanece coberto por testes unitários.
   - `QuestGraph`: Não é instanciado pelas cenas ativas; permanece coberto por testes unitários.
   - `SaveService`: Não é instanciado pelas cenas ativas; permanece coberto por testes unitários.

---

## 4. Controles e Entradas Padronizadas

O mapeamento de controles é centralizado em `src/services/InputService.ts`:

| Ação Lógica | Teclas Primárias | Teclas Secundárias |
| :--- | :--- | :--- |
| **Navegação / Mover** | Setas (Cima, Baixo, Esquerda, Direita) | W, S, A, D |
| **Confirmar / Interagir** | `Z` | `ENTER`, `ESPAÇO` |
| **Cancelar / Fechar / Menu** | `X` | `ESCAPE` |
| **Atalhos Rápidos** | `1` (Exploração) | `2` (Combate) |

---

## 5. Suíte de Testes Automatizados e Tipagem

- **Test Runner:** Node.js Test Runner nativo com carregamento dinâmico via `tsx` (`node --import tsx --test tests/**/*.test.ts`).
- **Verificação de Tipos:** `npm run typecheck` (`tsc --noEmit`) executado com `strict: true`, `noImplicitAny: true`, `moduleResolution: "bundler"`.

### Cobertura de Testes (25 testes / 5 suites):
1. [`tests/Combatant.test.ts`](file:///c:/Users/jonat/OneDrive/Documentos/07_Projetos_Dev_Python/sombras-de-brentel-resgate-de-rebekka/tests/Combatant.test.ts): 7 testes validando atributos, mitigação de dano por defesa, ganho de recurso ao ser atingido e atacar, habilidade técnica e cura.
2. [`tests/TurnEngine.test.ts`](file:///c:/Users/jonat/OneDrive/Documentos/07_Projetos_Dev_Python/sombras-de-brentel-resgate-de-rebekka/tests/TurnEngine.test.ts): 6 testes cobrindo FSM de turnos, ataque básico, turno de inimigos, vitória, derrota e fuga.
3. [`tests/InventoryModel.test.ts`](file:///c:/Users/jonat/OneDrive/Documentos/07_Projetos_Dev_Python/sombras-de-brentel-resgate-de-rebekka/tests/InventoryModel.test.ts): 5 testes validando saldo inicial, adição, remoção, uso de item e serialização/desserialização.
4. [`tests/QuestGraph.test.ts`](file:///c:/Users/jonat/OneDrive/Documentos/07_Projetos_Dev_Python/sombras-de-brentel-resgate-de-rebekka/tests/QuestGraph.test.ts): 4 testes cobrindo status inicial, avanço de missão, reset e serialização.
5. [`tests/SaveService.test.ts`](file:///c:/Users/jonat/OneDrive/Documentos/07_Projetos_Dev_Python/sombras-de-brentel-resgate-de-rebekka/tests/SaveService.test.ts): 3 testes validando codificação Base64 com suporte a UTF-8/acentuação, persistência e limpeza.
