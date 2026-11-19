# iago-site — Portfólio + Linktree + Tutoriais (Iago Bald)

@~/Code/claude-iagopessoal/CLAUDE.md

Site estático publicado no **Cloudflare Pages** em **iagobald.com.br** (repo GitHub: `iago-borges-eng/iago-site`). Marca, tom e restrições vêm do import acima.

## Deploy
`publica` = `git add -A` + commit + push. O Cloudflare Pages faz o deploy automático (~1 min) e atualiza tanto `iagobald.com.br` quanto `iago-site.pages.dev`.
IMPORTANTE: rodar git só aqui no Claude Code (nativo). Não deixar outra ferramenta rodar git nesta pasta pela "ponte" do desktop — cria `.git/index.lock` que a ponte não consegue apagar e trava o commit.

## Estrutura
- `index.html`            → iagobald.com.br            (portfólio, one-page)
- `links.html`            → iagobald.com.br/links       (linktree)
- `recursos/`  (antes `tutoriais/`; `_redirects` tem o 301)
  - `index.html`          → /recursos                   (hub — lista os cards de tutorial)
  - `style.css`           design system compartilhado dos tutoriais (largura máx. 760px)
  - `site-linktree-do-zero/index.html`   Tutorial 1: "Site + Linktree com o Claude"
  - `sistema-no-lovable/index.html`      Tutorial 2: "Sistema no Lovable"
  - `assets/logos/*.svg`   logos de marcas (lovable = coração gradiente, supabase, replit, vercel, bolt, bubble, claude, cloudflare…)
  - `assets/shots/*.jpg`   screenshots otimizadas usadas nos tutoriais (PNGs originais grandes são ignorados pelo git)

## Design system
- **Fontes**: Sora (títulos), Lato (corpo), Space Mono (labels/código).
- **Cores**: laranja `#FF6701` (hover `#ff8a3d`), fundo `#08090f`, bege `#F4F4F6`, navy `#0C0E23`; nos tutoriais também verde `#3ddc97` (dica) e âmbar `#ffb547` (aviso).
- **Marca**: logo = 3 barrinhas laranja (equalizer) + "Iago Bald". Frase-chave: "Traduzir o complexo em simples."
- **Componentes de tutorial** (`style.css`): `.outcome`, `.step` (nº laranja + hover de cor), `.callout` note/tip/warn (com ícone `.cic`), `.promptbox` (modelo/exemplo), `.alts` (prós/contras com logos), `.gloss` (glossário), `.diagram` (fluxo de 3 caixas), `.shot` (figura de imagem com legenda; `.shot.ph` = placeholder), `.hic` (ícone monoline no título).

## Convenções ao editar tutoriais
- Novo tutorial: criar `tutoriais/<slug>/index.html` + adicionar card em `tutoriais/index.html`. Reusar `style.css` e as classes acima.
- Imagens: colocar em `tutoriais/assets/shots/`, **otimizadas** (~1600px, JPEG q88 — os prints originais vêm com ~4 MB). Referenciar por caminho relativo (`../assets/shots/x.jpg`).
- Prévia renderizada: tutorial multi-arquivo não abre estilizado sozinho (CSS/imagens relativos). Pra revisar num visualizador, gerar versão self-contained com CSS inline + imagens em base64.

## Captura de lead (peça crítica)
- A captura fica embutida em **consultoria**, **mentoria** e na página **/formulario** (a home tem duas portas: **/papo** e **/formulario** — ver seção Agendamento). Faz `POST` direto pra **`leads_formulario`** no Supabase do **iago-bald** (mesma base do CRM), com a **chave publishable** (anon) e honeypot anti-bot. `respostas.origem` varia (`formulario`/`landing-consultoria`/`landing-mentoria`); um gatilho (`leads_formulario_to_funil`) cria o card no funil (col-lead). A **Newsletter** usa outra tabela (`newsletter_assinantes`). *(Corrigido 2026-10-26; antes dizia `leads_site`, que está dormente.)*
- **Segurança:** RLS OK. O `anon` só tem policy de **INSERT** em `leads_formulario` (`with check true`); **não há SELECT** pro anon, então a chave pública no HTML NÃO lê a lista de leads. Não afrouxar.
- **`nome` é OPCIONAL (coluna nullable) — NÃO re-adicionar `NOT NULL` em `leads_formulario.nome`.** O campo "Como te chamo?" é opcional (só telefone+email são obrigatórios) e o trigger `leads_formulario_to_funil` é null-safe (cai pra telefone/'Lead'). *Bug corrigido 2026-11-10: `nome` tinha virado NOT NULL (regressão) e derrubava TODO envio com nome em branco, em todos os forms (consultoria/mentoria/formulario) — erro `23502` → "Ops, não consegui enviar". Fix: `ALTER COLUMN nome DROP NOT NULL`.*
- Limitação: se o POST falhar, o lead se perde (só `alert`). Melhoria futura: fallback (e-mail/Formspree) ou retry.

## Agendamento — /papo (duas portas) — feito 2026-11-19
Fluxo único de "falar comigo", com **duas portas de mesmo peso** espalhadas pelo site:
- **Agendar um papo** → **`/papo`** = página de marca minimalista (mobile-first: só hero curto + iframe). Embute o **agendador do Google Appointment** (1 compromisso, **1 hora**, nome/sobrenome/email/telefone obrigatórios, Google Meet + convite automático pros dois). O Google **é o formulário** — não construir form próprio aqui.
  - URL do agendador no iframe: `calendar.google.com/calendar/appointments/schedules/AcZssZ2...?gv=true` (trocar aqui se mudar a página do Google). `/agenda` e `/agendar` fazem 301 → `/papo`.
  - A página fica **limpa** (sem passo-a-passo, sem fallback dentro). Se mexer: `header` é `position:fixed` → `main` precisa `padding-top:~102px` senão some sob o menu.
- **Enviar uma mensagem** → **`/formulario`** = quem não quer marcar hora, deixa contato (cai no mesmo `leads_formulario`).
- Os **dois botões iguais** (ícone laranja, mesmo estilo) aparecem: na **home** (hero) e no **`/links`** (seção "Falar comigo", classe `.doors`/`.door`). Cross-link em `/formulario` → `/papo`.
- **WhatsApp saiu do fluxo** mas está **comentado (não deletado)** em `links.html`, `diagnostico/`, e nos 3 tutoriais de `recursos/` — reusar no futuro. Mantidos: suporte do curso, grupo da Comunidade, follow-up pós-form, webhook do `/pagar`.
- **CRM:** o agendamento do Google **não** preenche o CRM pelo iframe (cross-origin). O caminho é o **evento no Google Calendar** → bald-ops já lê via `calendar-feed`. Fase 2 (no bald-ops): virar card no CRM + foco no dashboard. Não feito ainda.

## Hierarquia de ofertas + CTAs (modelo intermediário — feito 2026-11-19)
Remodelado pra clareza/foco (audit interno 7.5 → ~9.3). **Regras canônicas, NÃO reverter sem motivo:**
- **Par primário = Consultoria + Mentoria 1:1**, MESMO peso (done-for-you vs done-with-you) — as 2 coisas que vendem. Home: 2 cards grandes laranja (`.ladder.pair`); /links: 2 `.prod`.
- **Consultoria falada por RESULTADO, não por "sistema":** "resolvo a dor nº1 com a ferramenta certa (automação, IA, Claude configurado ou sistema sob medida)". Construção de sistema é UM entregável, não o rótulo (contexto Accelera 360 — memória `accelera-360-virada-modelo`).
- **Secundário (peso baixo):** Bald Lab (grátis), Workshops/palestras (pagos, "sob demanda", NÃO card grande — no /links é `.lk`), e o **Diagnóstico/quiz vira LINHA FINA**, nunca hero. Diagnóstico fica em **1–2 lugares só** (/links "comece por aqui" + linha no contato), NÃO em todo nav/página.
- **2 portas de contato, mesmo peso:** "Agendar um papo" (`/papo`) + "Enviar uma mensagem" (`/formulario`) — juntas no hero e no contato da home e no topo do /links.
- **Sistema de CTA:** nav "Falar comigo" → **`/papo`** em TODAS as páginas (era patchwork: consultoria ia pro form, cursos/recursos/newsletter pro /formulario). Mentoria = **1:1** por ora (formato ainda não decidido).
- **Fora de escopo até o Accelera definir o nicho:** página de produto, repricing, landing por nicho. Não bater nisso antes da Fase 1 do Accelera.

## SEO (feito 2026-09-23)
- `robots.txt` + `sitemap.xml` na raiz; JSON-LD (Person + ProfessionalService) no `index.html`; `canonical` em index, consultoria, mentoria e tutoriais.
- Ao criar página nova: adicionar a URL no `sitemap.xml` e um `<link rel="canonical">` no head.

## Pendências
- **Analytics (depende do Iago):** site voa cego, sem GA/Plausible/CF Web Analytics. Recomendado Cloudflare Web Analytics (grátis, sem cookie) — precisa pegar o beacon token no dashboard da Cloudflare.
- **Prova social:** sem depoimentos/logos/resultados; maior lacuna de conversão (depende de coletar material).
- Levar os ícones/transições novos (já no Tutorial 2 do Lovable) para o Tutorial 1 (site-linktree), pra ficarem iguais.
- Tutorial 2: faltam (opcionais) prints do botão **Publish** e do **sistema pronto** aparecendo.

## Preferência do Iago
Ser pensador crítico, não validador: apontar premissa errada antes de responder, propor caminho melhor sem ser pedido, discordar com argumento, sinalizar riscos e pontos cegos.
