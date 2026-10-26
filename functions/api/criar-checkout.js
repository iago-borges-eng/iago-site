// Pages Function — cria um link de pagamento no Mercado Pago (Checkout Pro).
// O token vive em env MP_ACCESS_TOKEN (configurado no painel do Cloudflare Pages),
// nunca no código. Recebe POST {descricao, valor, parcelas, nome?, email?} e
// devolve {init_point} — a URL do checkout pra mandar pro cliente.

// CORS restrito ao próprio domínio (requisições same-origin da mentoria/pagar não
// dependem de CORS; isto só barra chamada cross-site de outro domínio no navegador).
const CORS = {
  'Access-Control-Allow-Origin': 'https://iagobald.com.br',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-bald-secret',
};

// Catálogo com preço TRAVADO no servidor. Botões públicos de compra mandam
// só {produto:"<slug>"} — nunca o valor — pra ninguém adulterar o preço.
// FONTE ÚNICA do que se cobra. Ao mudar aqui, atualizar a vitrine em
// mentoria/index.html (o "3x R$97" é só display; quem cobra é este valor).
const CATALOG = {
  'mentoria-fundadora': {
    descricao: 'Mentoria O Dono Livre — turma fundadora',
    valor: 291,       // 3x R$97 (precço de fundador) — espelhar em mentoria/index.html
    parcelas: 3,
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const token = env.MP_ACCESS_TOKEN;
  if (!token) {
    return json({ error: 'MP_ACCESS_TOKEN não está configurado no Cloudflare Pages.' }, 500);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'JSON inválido.' }, 400);
  }

  let descricao, valor, parcelas;

  if (data.produto !== undefined && data.produto !== null && data.produto !== '') {
    // Botão público de compra: preço vem do catálogo, nunca do navegador.
    const item = CATALOG[String(data.produto)];
    if (!item) return json({ error: 'Produto desconhecido.' }, 400);
    descricao = item.descricao;
    valor = item.valor;
    parcelas = item.parcelas;
  } else {
    // Gerador interno /pagar: valor livre. EXIGE segredo (env PAGAR_SECRET) pra não
    // ser abusado publicamente. Fail-closed: sem o env configurado, ninguém gera.
    const segredo = env.PAGAR_SECRET;
    const enviado = request.headers.get('x-bald-secret') || '';
    if (!segredo || enviado !== segredo) {
      return json({ error: 'Gerador protegido: senha ausente ou inválida.' }, 401);
    }
    descricao = (String(data.descricao || '').trim() || 'Pagamento · Iago Bald').slice(0, 200);
    valor = Number(data.valor);
    parcelas = Math.min(Math.max(parseInt(data.parcelas, 10) || 12, 1), 12);
  }

  if (!Number.isFinite(valor) || valor < 5 || valor > 100000) {
    return json({ error: 'Valor inválido. Use um número entre R$5 e R$100.000.' }, 400);
  }

  const payer = {};
  if (data.email) payer.email = String(data.email).trim().slice(0, 120);
  if (data.nome) payer.name = String(data.nome).trim().slice(0, 80);
  const whats = data.whats ? String(data.whats).replace(/\D/g, '').slice(0, 20) : null;

  const ref = 'bald-' + Date.now();

  const pref = {
    items: [{
      title: descricao,
      quantity: 1,
      unit_price: Math.round(valor * 100) / 100,
      currency_id: 'BRL',
    }],
    payment_methods: { installments: parcelas },
    back_urls: {
      success: 'https://iagobald.com.br/pagar/?status=ok',
      pending: 'https://iagobald.com.br/pagar/?status=pendente',
      failure: 'https://iagobald.com.br/pagar/?status=falha',
    },
    auto_return: 'approved',
    statement_descriptor: 'IAGOBALD',
    external_reference: ref,
    // Lido pelo webhook (Fase 2) pra criar o cliente no CRM com dados reais.
    metadata: {
      produto: data.produto ? String(data.produto) : null,
      nome: payer.name || null,
      email: payer.email || null,
      whats: whats,
      // Vínculo pro webhook não duplicar: converte o lead do funil, ou fatura
      // num cliente que já existe, em vez de criar um segundo registro.
      lead_id: data.lead_id ? String(data.lead_id).slice(0, 60) : null,
      cliente_id: data.cliente_id ? String(data.cliente_id).slice(0, 60) : null,
      origem: 'site',
    },
  };
  if (payer.email || payer.name) pref.payer = payer;

  let resp, out;
  try {
    resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pref),
    });
    out = await resp.json();
  } catch (e) {
    return json({ error: 'Não consegui falar com o Mercado Pago.', detail: String(e) }, 502);
  }

  if (!resp.ok) {
    return json({ error: out.message || 'Erro ao criar o link no Mercado Pago.', detail: out }, 502);
  }

  return json({
    id: out.id,
    init_point: out.init_point,
    sandbox_init_point: out.sandbox_init_point,
    ref,
  });
}
