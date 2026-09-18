# Visão de Game Design e Narrativa: Sombras de Brentel

A transição da parte gráfica para o desenvolvimento do jogo propriamente dito exige que traduzamos as 162 páginas de *A Floresta Cinzenta* em uma experiência interativa focada no combate tático que acabamos de validar. 

Abaixo apresento a minha visão de como podemos estruturar o início, a evolução e o clímax do jogo com base no lore original.

## User Review Required
> [!IMPORTANT]
> Esta é uma proposta de alto nível (Game Design Document) para estruturar as "Cenas" do jogo na engine Phaser. Leia e avalie se a divisão em "Atos" e a progressão mecânica estão alinhadas com o que você imaginou para a adaptação do livro.

---

## 1. Estrutura Narrativa (Os 3 Atos)

## 1. Estrutura Narrativa (Baseada nos 14 Capítulos)
O livro é uma verdadeira carta de amor ao RPG de mesa, dedicando seus 6 primeiros capítulos inteiramente à origem e "criação/build" de cada personagem. O jogo terá **3 Atos Principais**, antecedidos por um prólogo focado nessa construção:

### Prólogo: As Fichas de Personagem (Capítulos 1 ao 6)
- **Foco em RPG:** Antes do encontro, o jogador será introduzido a cada herói individualmente (Joseph, Verônica, John, Alícia, Traudon e Rhogar). 
- **Gameplay:** Aqui o jogo apresenta as **Fichas de Personagem**, atributos, passivas raciais (ex: resistência a trovão da Verônica, transe élfico de Joseph) e magias. É o momento de "Criação do Personagem", honrando o detalhismo do livro.

### Ato I: Destinos Cruzados e o Primeiro Conflito (Capítulos 7 e 8)
- **O Encontro Clássico:** Todos convergem para a cidade de Rastphen, na taverna **Cauda do Dragão**. A barda Alícia narra o início da jornada.
- **A Primeira Ação em Comum (Tutorial):** John Bardem está rastreando um mercenário procurado (calvo, obeso e com uma queimadura no rosto). A tensão escala e resulta em uma grande briga de taverna envolvendo os mercenários. Esse será o nosso tutorial prático para as mecânicas de *Tension*, *Locks* e o trabalho em equipe dos seis recém-conhecidos.

### Ato II: Os Primeiros Passos na Neblina (Capítulos 9 ao 12)
- **O Núcleo do Jogo:** A jornada avança para a temida *Floresta Cinzenta*. O mapa do jogo se abre no estilo de nós de exploração (batalhas, eventos aleatórios, testes de perícia e acampamento).
- **Desafios Táticos:** Os inimigos (como os Guardiões Ancestrais) exigirão que o jogador domine a mecânica de *Party Swap* (troca de heróis durante a luta), forçando o uso de todos os 6 personagens para explorar as fraquezas corretas.

### Ato III: O Mistério Quase Resolvido (Capítulos 13 e 14)
- **O Clímax:** A descida às áreas mais obscuras e a revelação dos segredos que perturbam os heróis. 
- **Gameplay:** Lutas massivas contra chefes, exigindo perfeição no uso das *Skills* e *Penitence* acumuladas.

---

## 2. Evolução e Mecânicas de Jogo (Game Loop)

Para traduzir o livro em um RPG Tático recompensador, sugiro o seguinte *Core Loop*:

1. **Fase de Preparação (Acampamento/Cidade):**
   - Diálogos ricos baseados no texto do livro (desenvolvendo a relação entre os heróis).
   - Gerenciamento de itens e equipamentos (Upgrades de armas para mudar os tipos de dano necessários para quebrar *Locks*).
2. **Fase de Customização RPG:**
   - Gerenciamento de Fichas: Distribuir pontos de atributos, escolher magias e gerenciar inventário (fundamental para honrar a base literária).
3. **Fase de Exploração (Overworld):**
   - Movimentação em um mapa de nós (pontos focados) para manter a gameplay fluida e estratégica.
4. **Fase de Combate (Dark Fantasy Combat Scene):**
   - A tela tática que criamos. 
   - A dificuldade aumenta gradativamente: exigindo domínio absoluto de *Party Swap* e *Tension Gauge*.

## Open Questions
- **Estilo de Exploração:** Você prefere que fora do combate o jogador ande livremente pelos mapas (controle de personagem top-down, andando pela floresta) ou um sistema de "Nós/Pontos no Mapa" (mais focado na narrativa e pular direto para a ação)?
- **Sistema de Party:** Como o grupo oficial tem 6 personagens, durante o combate você imagina 3 em campo por vez (com a opção de trocar - *Swap* - no meio da luta, como em *Final Fantasy X*) ou todos os 6 na tela ao mesmo tempo (o que exigiria uma HUD e balanceamento bem diferentes)?
