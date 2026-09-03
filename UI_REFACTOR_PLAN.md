# FluentR — UI/UX Deep Refactor Plan

## 0. Auditoria (resumo)

**Stack real:** PWA estática — zero build, zero framework. HTML puro (`index.html`) carrega scripts globais em ordem (`data/*.js` → `js/core/*.js` → `js/lessonEngine.js` → `js/ui.js` → `js/router.js` → `js/app.js`). Não há bundler, não há JSX/componentes — `ui.js` é uma fábrica de *strings HTML*, `app.js` interpreta tudo via um único listener delegado `[data-action]`.

| Camada | Arquivo | Papel |
|---|---|---|
| Design tokens | `css/tokens.css` | cores, fontes, radius — light-first, dark via `[data-theme=dark]` |
| Reset/shell | `css/base.css` | app shell, topbar, bottom-nav, rail (desktop) |
| Componentes | `css/components.css` | todo componente compartilhado (botões, cards, path nodes, exercícios, badges...) |
| Layout de página | `css/pages.css` | ajustes específicos (onboarding, recap, week dots) |
| Responsivo | `css/responsive.css` | mobile-first → tablet (rail) → desktop |
| Persistência | `js/core/storage.js` + `dataService.js` | IndexedDB, 2 stores: `profiles`, `couple`. Um documento JSON por perfil. |
| Gamificação | `js/core/gamification.js` | XP, level curve, hearts, streak, couple streak, badges |
| Motor de lição | `js/lessonEngine.js` | Path state, Smart Review, Spot the Brazilian, sessões |
| Render | `js/ui.js` (968 linhas) | ícones inline SVG + toda função `render*()` |
| Interação | `js/app.js` (727 linhas) | boot, `AppState`, todos os handlers de `[data-action]` |
| Conteúdo | `data/*.js` | 80 exercícios do Path, 55 Traps, 28 Say, 24 Writing, 24 Technical, 8 SOS packs, 30 Couple, 20 placement, 31 badges |

**O que já existe e deve ser preservado:**
- Modelo de dados por perfil (`flDefaultProfile`) já tem `exerciseStats`, `vocabulary`, `history`, `pathProgress`, `weeklyXP`, `pillarActivity` — não recriar do zero, **estender**.
- `dataService.js` já é a única porta de persistência (README documenta isso explicitamente para permitir troca por Supabase no futuro) — qualquer mudança de schema entra por `flDefaultProfile`, nunca direto no storage.
- Sistema de rotas via hash router simples, `AppState` centralizado em `app.js`.
- Todas as 5 colunas (Traps, SOS, Say, Writing, Technical) já funcionam ponta a ponta.
- Tokens de cor **já usam nomes semânticos** (`--brand`, `--xp`, `--streak`, `--couple`, `--success`, `--danger`, rarezas de badge) — a base do design system pedido já existe, só precisa de nova paleta + tokens novos, não de uma reescrita de nomenclatura.

**Lacunas em relação ao pedido:**
1. Paleta é "warm-violet" claro-primeiro — o pedido quer dark premium neon como identidade default.
2. Sem glassmorphism, glow, profundidade — cards são flat com borda fina.
3. Sem foto de perfil (só iniciais coloridas via `avatar()`).
4. Sem estados do mascote Flu (não há mascote implementado ainda).
5. Feedback de exercício é um único parágrafo (`ex.explanation`) — não tem a estrutura Why/Grammar/Common Mistake/Natural/More examples pedida.
6. Banco de conteúdo é pequeno e estático (80 exercícios no Path) — sem spaced repetition, cooldown por item além do XP-farm cooldown de 4h, sem `mastery_score`/`next_review_at` por item.
7. `exerciseStats` já rastreia `seen/correct/incorrect/lastAnsweredAt` por exercício — é a base certa para um motor de repetição espaçada, mas falta a lógica de seleção 70/20/10 e o cooldown de janela deslizante.

---

## 1. Estratégia geral

Esta é uma refatoração **em camadas, aditiva onde possível**:
- **Fase 1 — Design System + Home** (esta entrega)
- Fase 2 — Learn (caminho visual) + Lesson player + feedback PT-BR
- Fase 3 — Profile (foto, skills) + Couple Mode
- Fase 4 — Motor de conteúdo (spaced repetition, expansão de banco, vocabulary engine)
- Fase 5 — Mascote Flu (estados) + microinterações finas
- Fase 6 — Responsividade fina + QA final

Nenhuma fase remove `data-action` existentes, muda assinaturas de `dataService`, ou apaga dado de perfil salvo. Migração de schema é sempre com fallback (`profile.photo || null`, etc.) para não quebrar perfis já salvos no IndexedDB do usuário.

---

## 2. Fase 1 — Design System (implementando agora)

### 2.1 Tokens (`css/tokens.css`)
Reescrita completa, **mantendo os mesmos nomes de variável** (`--paper`, `--surface`, `--surface-alt`, `--ink`, `--brand`, `--xp`, `--streak`, `--couple`, `--success`, `--danger`, `--rarity-*`) para não quebrar nenhuma referência inline em `ui.js`/`components.css`. Isso muda o produto inteiro visualmente sem tocar em HTML strings.

- Dark vira o modo **default** (`:root`), light vira o override (`[data-theme="light"]`) — inverte a prioridade atual.
- Paleta nova: `#0D132B` (bg), `#12172A` (surface), `#2563FF` (blue/info), `#00D4B3` (cyan), `#7CFC72` (lime), `#8B5CF6` (purple/brand), `#FF5BAE` (pink/couple), `#FF9F1C` (orange/xp), `#FFD60A` (yellow), `#EBECF3` (texto).
- Roxo (`#8B5CF6`) vira `--brand`. Demais cores mantidas como semânticas (xp=laranja, streak=laranja-avermelhado, couple=pink, success=lime/cyan, danger=vermelho).
- Tokens novos adicionados (sem remover os antigos): `--surface-hover`, `--border`, `--border-highlight`, `--glow-brand`, `--glow-couple`, `--glow-xp`, `--shadow-glass`.

### 2.2 Componentes (`css/components.css`, aditivo)
- `.card`: fundo com leve transparência + `backdrop-filter: blur()`, borda 1px com `--border`, sombra suave + glow sutil no hover.
- `.hero` (Daily Progress): gradiente roxo→azul premium com brilho radial, mantendo estrutura atual.
- `.league-card`: glow leve na borda, avatares maiores, barra comparativa com gradiente cyan/pink.
- `.pillar-card`: hover com leve translateY + glow colorido por pilar, ícones com fundo glass.
- `.path-node`: glow no nó "available", linha conectora com gradiente iluminado.
- `.btn-primary`: gradiente + glow no hover/active.
- `.badge-card` (unlocked): glow por raridade.
- Transições padronizadas 150–220ms (`cubic-bezier(.16,1,.3,1)`), sem exagero.

### 2.3 Home (`js/ui.js` → `renderHome`, `pillarCard`)
- Mantém a estrutura de dados e `data-action`s existentes.
- Adiciona 5ª pillar card (Technical English) à grade da Home, hoje só em Practice.
- Ajusta a nota da Couple League para o tom de provocação pedido (`"Rayssa is ahead by 280 XP 😏"` / `"You just took the lead 🔥"`).
- Nenhuma função nova de dado — só template + classes.

### 2.4 Fora de escopo nesta entrega (fica para as próximas fases, listadas acima)
Foto de perfil, mascote, feedback PT-BR estruturado, motor de repetição espaçada e expansão massiva de conteúdo são mudanças de **modelo de dados e de conteúdo**, não só visuais — puxam schema (`flDefaultProfile`), `data/*.js` novo formato de item, e telas inteiras novas (Couple Mode, Profile). Ficam para as Fases 2–4, para não misturar risco de regressão de dado com refatoração visual.

---

## 3. Mudanças de banco/dados previstas (Fases 3–4, não executadas agora)
- `profile.photo`: `{ dataUrl | path, x, y, scale }` — fallback iniciais quando `null`.
- `profile.vocabulary[term]` ganha `mastery: 'new'|'learning'|'weak'|'mastered'`, `contexts: []`.
- Novo formato de item de conteúdo: `{ id, phrase, translation, lemma, topic, grammar_point, skill, cefr_level, difficulty, frequency, times_seen, times_correct, times_wrong, last_seen, mastery_score, next_review_at }` — vive em `exerciseStats` + novo índice em `data/*.js`, sem quebrar o formato atual de exercício (`question/options/answer/explanation`), que continua sendo o "payload" de exibição.
- Seleção 70/20/10 implementada em `lessonEngine.js` como nova função `buildAdaptiveSession()`, ao lado das existentes (`buildSmartReview`, `buildQuickStudy`), sem remover as atuais.

---

## 4. Testes por etapa
Após cada fase: abrir via `python -m http.server 8000`, testar fluxo Home → Learn → Lesson → Profile → Couple League em light e dark, e nos 3 breakpoints (mobile <900px, tablet, desktop ≥1180px). Nenhuma funcionalidade existente pode regredir — checklist manual porque não há suíte de testes automatizada neste projeto.
