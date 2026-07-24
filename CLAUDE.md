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

## Pendências
- Levar os ícones/transições novos (já no Tutorial 2 do Lovable) para o Tutorial 1 (site-linktree), pra ficarem iguais.
- Tutorial 2: faltam (opcionais) prints do botão **Publish** e do **sistema pronto** aparecendo.

## Preferência do Iago
Ser pensador crítico, não validador: apontar premissa errada antes de responder, propor caminho melhor sem ser pedido, discordar com argumento, sinalizar riscos e pontos cegos.
