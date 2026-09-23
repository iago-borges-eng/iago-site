# iago-site — Portfólio + Linktree + Tutoriais (Iago Bald)

@~/Documents/claude-iagopessoal/CLAUDE.md

Site estático publicado no **Cloudflare Pages** em **iagobald.com.br** (repo GitHub: `iago-borges-eng/iago-site`). Marca, tom e restrições vêm do import acima.

## Deploy
`publica` = `git add -A` + commit + push. O Cloudflare Pages faz o deploy automático (~1 min) e atualiza tanto `iagobald.com.br` quanto `iago-site.pages.dev`.
IMPORTANTE: rodar git só aqui no Claude Code (nativo). Não deixar outra ferramenta rodar git nesta pasta pela "ponte" do desktop — cria `.git/index.lock` que a ponte não consegue apagar e trava o commit.

## Estrutura
- `index.html`            → iagobald.com.br            (portfólio, one-page)
- `links.html`            → iagobald.com.br/links       (linktree)
- `tutoriais/`
  - `index.html`          → /tutoriais                  (hub — lista os cards de tutorial)
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
- O form existe na **home** (`index.html`, seção contato) e nas páginas de oferta **consultoria** e **mentoria** (bloco `.cta`, feito 2026-09-23). Faz `POST` direto pra `leads_site` no Supabase do **iago-bald** (mesma base do CRM), com a **chave publishable** (anon) e honeypot anti-bot. O lead cai no funil com `origem:'site'` (a RLS exige `origem='site'`; a página de origem vai anotada no `motivo`, ex.: "(via página consultoria)").
- **Segurança (auditada 2026-09-23):** RLS OK. O `anon` só tem policy de **INSERT** com `with_check (origem='site')`; **não há SELECT** pro anon, então a chave pública no HTML NÃO lê a lista de leads. Não afrouxar essa policy.
- Limitação: se o POST falhar, o lead se perde (só `alert`). Melhoria futura: fallback (e-mail/Formspree) ou retry.

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
